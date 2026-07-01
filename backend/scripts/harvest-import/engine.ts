/**
 * Import engine for the harvest import pipeline.
 *
 * Responsibilities:
 *  1. Resolve tenant by name or UUID
 *  2. Look up crops, varieties, greenhouses from the DB
 *  3. Group parsed rows into batches → harvests → entries
 *  4. In dry-run mode: validate and report, write nothing
 *  5. In commit mode: find-or-create batches, skip duplicate harvests,
 *     insert new harvests with their entries
 *
 * Deduplication strategy:
 *   Batch   → matched by tenantId + name (case-insensitive); created if absent
 *   Harvest → matched by tenantId + batchId + date (exact); skipped if present
 *
 * Performance:
 *   Duplicate harvest detection is done in ONE bulk query (not N individual
 *   findOne calls). All new harvests are inserted in a single transaction with
 *   two bulk INSERT statements — one for harvests, one for entries — bypassing
 *   TypeORM cascade to avoid the N+1 per-entry SELECT+INSERT pattern.
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Variety } from '@modules/variety/entities/variety.entity';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';
import { Batch } from '@modules/batch/entities/batch.entity';
import { Harvest } from '@modules/harvest/entities/harvest.entity';
import { HarvestEntry } from '@modules/harvest/entities/harvest-entry.entity';
import { BatchStatus, InputMode } from '@common/enums';
import type { ParsedRow, ImportReport, RowIssue } from './types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LookupCache {
  crops: Map<string, Crop>;           // lowercase name → Crop
  varieties: Map<string, Variety>;    // `${cropId}::${lowercase name}` → Variety
  greenhouses: Map<string, Greenhouse>; // lowercase name → Greenhouse (tenant-scoped)
  batches: Map<string, Batch>;        // `${tenantId}::${lowercase name}` → Batch
}

/** Internal plan built before any DB writes. */
interface HarvestPlan {
  batch: Batch;
  harvestDate: string; // YYYY-MM-DD
  rowsForDate: ParsedRow[];
}

// ─── Main entry point ────────────────────────────────────────────────────────

export async function runImport(
  dataSource: DataSource,
  tenantNameOrId: string,
  parsedRows: ParsedRow[],
  parseIssues: RowIssue[],
  mapper: 'knaup' | 'frutania',
  file: string,
  dryRun: boolean,
): Promise<ImportReport> {
  const startedAt = new Date().toISOString();
  const report: ImportReport = {
    tenant: tenantNameOrId,
    tenantId: '',
    file,
    mapper,
    dryRun,
    startedAt,
    finishedAt: '',
    totalRows: parsedRows.length,
    validRows: 0,
    invalidRows: parseIssues.filter((i) => i.level === 'error').length,
    created: 0,
    skippedDuplicates: 0,
    failed: 0,
    issues: [...parseIssues],
    globalWarnings: [],
  };

  // ── Resolve tenant ────────────────────────────────────────────────────────
  const tenantRepo = dataSource.getRepository(Tenant);
  let tenant: Tenant | null = null;

  if (/^[0-9a-f-]{36}$/i.test(tenantNameOrId)) {
    tenant = await tenantRepo.findOne({ where: { id: tenantNameOrId } });
  }
  if (!tenant) {
    const all = await tenantRepo.find();
    tenant =
      all.find((t) => t.name.toLowerCase() === tenantNameOrId.toLowerCase()) ??
      null;
  }

  if (!tenant) {
    throw new Error(
      `Tenant "${tenantNameOrId}" not found. ` +
        `Pass the exact tenant name or UUID shown in the vGreens Lab admin panel.`,
    );
  }

  report.tenant = tenant.name;
  report.tenantId = tenant.id;

  // ── Build lookup cache ────────────────────────────────────────────────────
  const cache: LookupCache = {
    crops: new Map(),
    varieties: new Map(),
    greenhouses: new Map(),
    batches: new Map(),
  };

  await preloadCrops(dataSource, cache);
  await preloadVarieties(dataSource, cache);
  await preloadGreenhouses(dataSource, cache, tenant.id);
  await preloadBatches(dataSource, cache, tenant.id);

  // ── Group rows: batchKey → harvestDate → ParsedRow[] ─────────────────────
  type DateMap = Map<string, ParsedRow[]>;
  const grouped = new Map<string, DateMap>();

  for (const row of parsedRows) {
    if (!grouped.has(row.batchKey)) grouped.set(row.batchKey, new Map());
    const dateMap = grouped.get(row.batchKey)!;
    if (!dateMap.has(row.harvestDate)) dateMap.set(row.harvestDate, []);
    dateMap.get(row.harvestDate)!.push(row);
  }

  // ── Phase 1: Resolve batches and build harvest plan ───────────────────────
  const plans: HarvestPlan[] = [];

  for (const [, dateMap] of grouped.entries()) {
    const sampleRow = dateMap.values().next().value![0] as ParsedRow;

    let batch: Batch | null;
    try {
      batch = await resolveOrCreateBatch(
        dataSource,
        cache,
        sampleRow,
        tenant.id,
        dryRun,
        report,
      );
    } catch (err: any) {
      const reason = `Batch "${sampleRow.batchKey}": ${err.message}`;
      report.globalWarnings.push(reason);
      for (const rows of dateMap.values()) {
        for (const r of rows) {
          report.issues.push({ sourceRow: r.sourceRow, level: 'error', reason });
          report.failed++;
        }
      }
      continue;
    }

    if (!batch) continue;

    for (const [harvestDate, rowsForDate] of dateMap.entries()) {
      plans.push({ batch, harvestDate, rowsForDate });
    }
  }

  // ── Phase 2: Bulk dedup check ─────────────────────────────────────────────
  // One query to fetch all existing harvests for the relevant batches —
  // instead of N individual findOne calls inside the loop.
  const realBatchIds = [
    ...new Set(plans.filter((p) => p.batch.id !== 'dry-run').map((p) => p.batch.id)),
  ];

  const existingKeys = new Set<string>(); // `${batchId}::${YYYY-MM-DD}`

  if (realBatchIds.length > 0) {
    const existing = await dataSource
      .getRepository(Harvest)
      .createQueryBuilder('h')
      .select(['h.batchId', 'h.date'])
      .where('h.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('h.batchId IN (:...batchIds)', { batchIds: realBatchIds })
      .andWhere('h.deletedAt IS NULL')
      .getMany();

    for (const h of existing) {
      const d =
        h.date instanceof Date
          ? h.date.toISOString().slice(0, 10)
          : String(h.date).slice(0, 10);
      existingKeys.add(`${h.batchId}::${d}`);
    }
  }

  // ── Phase 3a: Dry-run — just report, no writes ────────────────────────────
  if (dryRun) {
    for (const plan of plans) {
      const isDryRunBatch = plan.batch.id === 'dry-run';
      const dupeKey = `${plan.batch.id}::${plan.harvestDate}`;

      if (!isDryRunBatch && existingKeys.has(dupeKey)) {
        report.skippedDuplicates++;
        report.issues.push({
          sourceRow: plan.rowsForDate[0].sourceRow,
          level: 'warning',
          reason: `[DRY-RUN] Harvest ${plan.harvestDate} for batch "${plan.batch.name}" already exists — would skip`,
        });
      } else {
        report.validRows += plan.rowsForDate.length;
        report.issues.push({
          sourceRow: plan.rowsForDate[0].sourceRow,
          level: 'warning',
          reason: `[DRY-RUN] Would create harvest ${plan.harvestDate} for batch "${plan.batch.name}" (${plan.rowsForDate.length} entries)`,
        });
      }
    }

    report.finishedAt = new Date().toISOString();
    return report;
  }

  // ── Phase 3b: Commit — bulk insert ───────────────────────────────────────
  const toCreate = plans.filter(
    (p) => !existingKeys.has(`${p.batch.id}::${p.harvestDate}`),
  );

  report.skippedDuplicates = plans.length - toCreate.length;

  if (toCreate.length > 0) {
    try {
      await dataSource.transaction(async (manager) => {
        // Single INSERT for all new harvests
        const harvestResult = await manager
          .getRepository(Harvest)
          .insert(
            toCreate.map((p) => ({
              tenantId: tenant!.id,
              batchId: p.batch.id,
              date: new Date(p.harvestDate),
              photoUrls: [],
            })),
          );

        // Build all entries, mapping each to its newly inserted harvest ID
        const allEntries = toCreate.flatMap((p, i) => {
          const harvestId = harvestResult.identifiers[i]?.id as string;
          return p.rowsForDate.map((row) => ({
            harvestId,
            rowX: row.rowX ?? [],
            rowY: row.rowY ?? [],
            classKgs: row.classKgs,
            waste: row.waste ?? 0,
            totalFruitWeight: 0,
            avgFruitWeight: 0,
            avgBrix: 0,
            brixReadings: [],
          }));
        });

        if (allEntries.length > 0) {
          // Single INSERT for all entries — bypasses cascade, avoids per-entry SELECTs
          await manager.getRepository(HarvestEntry).insert(allEntries);
        }
      });

      report.created = toCreate.length;
      report.validRows = toCreate.reduce(
        (sum, p) => sum + p.rowsForDate.length,
        0,
      );
    } catch (err: any) {
      const reason = `Bulk insert failed: ${err.message}`;
      report.failed = toCreate.reduce(
        (sum, p) => sum + p.rowsForDate.length,
        0,
      );
      for (const p of toCreate) {
        report.issues.push({
          sourceRow: p.rowsForDate[0].sourceRow,
          level: 'error',
          reason,
        });
      }
      report.globalWarnings.push(reason);
    }
  }

  report.finishedAt = new Date().toISOString();
  return report;
}

// ─── Batch resolution ─────────────────────────────────────────────────────────

async function resolveOrCreateBatch(
  dataSource: DataSource,
  cache: LookupCache,
  row: ParsedRow,
  tenantId: string,
  dryRun: boolean,
  report: ImportReport,
): Promise<Batch | null> {
  const batchCacheKey = `${tenantId}::${row.batchName.toLowerCase()}`;

  if (cache.batches.has(batchCacheKey)) {
    return cache.batches.get(batchCacheKey)!;
  }

  // ── Resolve crop (required) ────────────────────────────────────────────────
  let crop: Crop | undefined;
  if (row.cropNameHint) {
    crop = cache.crops.get(row.cropNameHint.toLowerCase());
    if (!crop) {
      for (const [key, c] of cache.crops.entries()) {
        if (
          key.includes(row.cropNameHint.toLowerCase()) ||
          row.cropNameHint.toLowerCase().includes(key)
        ) {
          crop = c;
          break;
        }
      }
    }
  }

  if (!crop) {
    throw new Error(
      `Crop "${row.cropNameHint ?? '(unknown)'}" not found in database. ` +
        `Please create the crop via the vGreens Lab admin panel first.`,
    );
  }

  // ── Resolve variety (optional) ─────────────────────────────────────────────
  let variety: Variety | undefined;
  if (row.varietyNameHint) {
    const varKey = `${crop.id}::${row.varietyNameHint.toLowerCase()}`;
    variety = cache.varieties.get(varKey);

    if (!variety) {
      for (const [key, v] of cache.varieties.entries()) {
        if (
          key.startsWith(`${crop.id}::`) &&
          (key.includes(row.varietyNameHint.toLowerCase()) ||
            row.varietyNameHint.toLowerCase().includes(key.split('::')[1]))
        ) {
          variety = v;
          break;
        }
      }
    }

    if (!variety) {
      report.globalWarnings.push(
        `Variety "${row.varietyNameHint}" not found for crop "${crop.name}". ` +
          `Batch will be created without a variety link.`,
      );
    }
  }

  // ── Resolve greenhouse (optional) ─────────────────────────────────────────
  let greenhouse: Greenhouse | undefined;
  if (row.greenhouseNameHint) {
    greenhouse = cache.greenhouses.get(row.greenhouseNameHint.toLowerCase());

    if (!greenhouse) {
      for (const [key, gh] of cache.greenhouses.entries()) {
        if (
          key.includes(row.greenhouseNameHint.toLowerCase()) ||
          row.greenhouseNameHint.toLowerCase().includes(key)
        ) {
          greenhouse = gh;
          break;
        }
      }
    }

    if (!greenhouse) {
      report.globalWarnings.push(
        `Greenhouse "${row.greenhouseNameHint}" not found for tenant. ` +
          `Batch will be created without a greenhouse link.`,
      );
    }
  }

  if (dryRun) {
    report.globalWarnings.push(
      `[DRY-RUN] Would create/find batch "${row.batchName}" ` +
        `(crop: ${crop.name}, variety: ${variety?.name ?? 'none'}, ` +
        `greenhouse: ${greenhouse?.name ?? 'none'})`,
    );
    const fakeBatch = { id: 'dry-run', name: row.batchName } as Batch;
    cache.batches.set(batchCacheKey, fakeBatch);
    return fakeBatch;
  }

  // ── Find existing batch by name (case-insensitive) ─────────────────────────
  const batchRepo = dataSource.getRepository(Batch);
  const existing = await batchRepo
    .createQueryBuilder('b')
    .where('b.tenantId = :tenantId', { tenantId })
    .andWhere('LOWER(b.name) = :name', { name: row.batchName.toLowerCase() })
    .andWhere('b.deletedAt IS NULL')
    .getOne();

  if (existing) {
    cache.batches.set(batchCacheKey, existing);
    return existing;
  }

  // ── Create new batch ───────────────────────────────────────────────────────
  const newBatch = batchRepo.create({
    tenantId,
    cropId: crop.id,
    varietyId: variety?.id ?? null,
    greenhouseId: greenhouse?.id ?? null,
    name: row.batchName,
    status: BatchStatus.ACTIVE,
    inputMode: InputMode.WEIGHT,
    plantingDate: new Date(),
    totalPlants: row.totalPlantsHint ?? 0,
    numberOfRows: 0,
    rowLength: 0,
    rowSpacing: 0,
    plantsPerMeter: 0,
    lostPlants: 0,
    cultivationArea: 0,
    replicates: 1,
  });

  const savedBatch = await batchRepo.save(newBatch);
  cache.batches.set(batchCacheKey, savedBatch);
  return savedBatch;
}

// ─── Cache preloaders ─────────────────────────────────────────────────────────

async function preloadCrops(ds: DataSource, cache: LookupCache): Promise<void> {
  const crops = await ds
    .getRepository(Crop)
    .find({ where: { deletedAt: null as any } });
  for (const c of crops) {
    cache.crops.set(c.name.toLowerCase(), c);
  }
}

async function preloadVarieties(
  ds: DataSource,
  cache: LookupCache,
): Promise<void> {
  const varieties = await ds
    .getRepository(Variety)
    .find({ where: { deletedAt: null as any } });
  for (const v of varieties) {
    cache.varieties.set(`${v.cropId}::${v.name.toLowerCase()}`, v);
  }
}

async function preloadGreenhouses(
  ds: DataSource,
  cache: LookupCache,
  tenantId: string,
): Promise<void> {
  const greenhouses = await ds
    .getRepository(Greenhouse)
    .find({ where: { tenantId, deletedAt: null as any } });
  for (const gh of greenhouses) {
    cache.greenhouses.set(gh.name.toLowerCase(), gh);
  }
}

async function preloadBatches(
  ds: DataSource,
  cache: LookupCache,
  tenantId: string,
): Promise<void> {
  const batches = await ds
    .getRepository(Batch)
    .find({ where: { tenantId, deletedAt: null as any } });
  for (const b of batches) {
    if (b.name) {
      cache.batches.set(`${tenantId}::${b.name.toLowerCase()}`, b);
    }
  }
}

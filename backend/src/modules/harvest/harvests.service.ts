import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  type OnModuleInit,
} from '@nestjs/common';
import { BaseService } from '@common/services';
import { Harvest } from './entities/harvest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHarvestInput } from './dto/create-harvest.input';
import { UpdateHarvestInput } from './dto/update-harvest.input';
import { HarvestEntryInput } from './dto/harvest-entry.input';
import { HarvestEntry } from './entities/harvest-entry';
import { HarvestFilterInput } from './dto/harvest-filter.input';
import { DashboardFilterInput } from './dto/dashboard-filter.input';
import {
  HarvestDashboardMetrics,
  YieldOverTimeData,
  ClassDistributionData,
  BrixTrendData,
  FruitWeightTrendData,
  CumulativeYieldData,
} from './dto/dashboard-metrics.dto';
import { HarvestBatchListItem } from './dto/harvest-batch-list-item.dto';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';
import { OrderDirection } from '@/common/enums/order-direction.enum';
import { buildBatchNumber } from './utils/batch-number.util';

@Injectable()
export class HarvestsService
  extends BaseService<Harvest>
  implements OnModuleInit
{
  private readonly logger = new Logger(HarvestsService.name);

  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
  ) {
    super(harvestRepository);
  }

  // Backfill historical harvest rows whose yieldPerPlant is still NULL because
  // they were inserted before the column existed. Idempotent: subsequent boots
  // hit zero matching rows and the UPDATE returns immediately.
  async onModuleInit(): Promise<void> {
    try {
      const result: unknown = await this.harvestRepository.query(
        `UPDATE harvests
         SET "yieldPerPlant" = ROUND(
           (("classA"::numeric + "classB"::numeric) / "totalPlants")::numeric,
           2
         )
         WHERE "yieldPerPlant" IS NULL
           AND "totalPlants" > 0
           AND ("classA" > 0 OR "classB" > 0)`,
      );
      // The pg driver returns `[rows, rowCount]` for UPDATE statements.
      const updated =
        Array.isArray(result) && typeof result[1] === 'number' ? result[1] : 0;
      if (updated > 0) {
        this.logger.log(
          `Backfilled yieldPerPlant for ${updated} historical harvest row(s).`,
        );
      }
    } catch (error) {
      this.logger.error(
        `yieldPerPlant backfill failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    await this.backfillBatchNumbers();
  }

  // Generate batchNumber for historical rows inserted before the column existed.
  // The varietyLetters logic is awkward in SQL, so compute it in JS: fetch the
  // rows still missing a value (plantingDate cast to text to read its YYYY-MM-DD
  // form unshifted) and update each. Idempotent — once filled, the SELECT
  // returns zero rows on subsequent boots.
  private async backfillBatchNumbers(): Promise<void> {
    try {
      const rows: Array<{
        id: string;
        variety: string;
        plantingDate: string;
      }> = await this.harvestRepository.query(
        `SELECT id, variety, "plantingDate"::text AS "plantingDate"
         FROM harvests
         WHERE "batchNumber" IS NULL`,
      );

      for (const row of rows) {
        await this.harvestRepository.update(row.id, {
          batchNumber: buildBatchNumber(row.variety, row.plantingDate),
        });
      }

      if (rows.length > 0) {
        this.logger.log(
          `Backfilled batchNumber for ${rows.length} historical harvest row(s).`,
        );
      }
    } catch (error) {
      this.logger.error(
        `batchNumber backfill failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private readonly harvestRelations = ['tenant', 'createdBy'] as const;

  private computeRowSpacing(
    cultivationArea: number,
    numberOfRows: number,
    rowLength: number,
  ): number {
    const denominator = numberOfRows * rowLength;
    if (denominator <= 0) return 0;
    return cultivationArea / denominator;
  }

  private getBatchKey(harvest: Harvest): string {
    return harvest.parentBatchId ?? harvest.id;
  }

  private roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // Per-harvest yield-per-plant: (classA + classB) / totalPlants. Stored on
  // each Harvest row by create/update so the value is queryable without
  // re-deriving it. Null when the harvest has no plant count (typical for
  // child harvest rows — totalPlants lives on the parent batch).
  private computeYieldPerPlant(
    classA: number,
    classB: number,
    totalPlants: number,
  ): number | null {
    if (totalPlants <= 0) return null;
    return this.roundTo2((classA + classB) / totalPlants);
  }

  // Per-row avg fruit weight: (classA + classB) / fruitCount, computed on the
  // fly so old rows with stale `avgFruitWeight` columns (left over from when
  // total fruit weight was a user input) don't poison the dashboard.
  // Returns null when there's no fruit-count measurement or no sellable yield.
  private computeRowAvgFruitWeight(harvest: Harvest): number | null {
    if (harvest.fruitCount <= 0) return null;
    const sellable = harvest.classA + harvest.classB;
    if (sellable <= 0) return null;
    return sellable / harvest.fruitCount;
  }

  // Average of the positive readings, rounded to 1 decimal. Mirrors the
  // frontend computeAvgBrix so brix shown in the UI matches what we store.
  private avgOfPositive(values: number[]): number {
    const positive = values.filter((v) => v > 0);
    if (positive.length === 0) return 0;
    return (
      Math.round(
        (positive.reduce((sum, v) => sum + v, 0) / positive.length) * 10,
      ) / 10
    );
  }

  // Fill defaults and re-derive a single sub-entry's avgBrix and avgFruitWeight
  // so the backend stays the source of truth for the derived fields.
  private normalizeEntry(entry: HarvestEntryInput): HarvestEntry {
    const brixReadings = entry.brixReadings ?? [];
    const fruitCount = entry.fruitCount ?? 0;
    const totalFruitWeight = entry.totalFruitWeight ?? 0;
    return {
      classA: entry.classA ?? 0,
      classB: entry.classB ?? 0,
      waste: entry.waste ?? 0,
      rowX: entry.rowX ?? 0,
      rowY: entry.rowY ?? 0,
      brixReadings,
      avgBrix: this.avgOfPositive(brixReadings),
      fruitCount,
      totalFruitWeight,
      avgFruitWeight:
        fruitCount > 0 && totalFruitWeight > 0
          ? Math.round((totalFruitWeight / fruitCount) * 1000) / 1000
          : 0,
    };
  }

  // Derive the flat top-level aggregate fields from a set of sub-entries.
  // classA/classB/waste/fruitCount/totalFruitWeight are summed; brix is pooled
  // and averaged; avgFruitWeight is Σweight ÷ Σcount; rowX/rowY become the span
  // (min start row, max end row) across entries.
  private aggregateEntries(rawEntries: HarvestEntryInput[]): {
    entries: HarvestEntry[];
    classA: number;
    classB: number;
    waste: number;
    avgBrix: number;
    brixReadings: number[];
    fruitCount: number;
    totalFruitWeight: number;
    avgFruitWeight: number;
    rowX: number;
    rowY: number;
  } {
    const entries = rawEntries.map((e) => this.normalizeEntry(e));
    const classA = entries.reduce((s, e) => s + e.classA, 0);
    const classB = entries.reduce((s, e) => s + e.classB, 0);
    const waste = entries.reduce((s, e) => s + e.waste, 0);
    const fruitCount = entries.reduce((s, e) => s + e.fruitCount, 0);
    const totalFruitWeight = entries.reduce(
      (s, e) => s + e.totalFruitWeight,
      0,
    );
    const brixReadings = entries.flatMap((e) => e.brixReadings);
    const rowXs = entries.map((e) => e.rowX).filter((v) => v > 0);
    const rowYs = entries.map((e) => e.rowY).filter((v) => v > 0);
    return {
      entries,
      classA,
      classB,
      waste,
      avgBrix: this.avgOfPositive(brixReadings),
      brixReadings,
      fruitCount,
      totalFruitWeight,
      avgFruitWeight:
        fruitCount > 0 && totalFruitWeight > 0
          ? Math.round((totalFruitWeight / fruitCount) * 1000) / 1000
          : 0,
      rowX: rowXs.length > 0 ? Math.min(...rowXs) : 0,
      rowY: rowYs.length > 0 ? Math.max(...rowYs) : 0,
    };
  }

  private isDashboardPlaceholder(harvest: Harvest): boolean {
    return (
      harvest.status === HarvestStatus.DRAFT &&
      harvest.parentBatchId == null &&
      harvest.classA === 0 &&
      harvest.classB === 0 &&
      harvest.waste === 0 &&
      harvest.avgBrix === 0 &&
      harvest.rowX === 0 &&
      harvest.rowY === 0 &&
      harvest.photos === 0
    );
  }

  async findAllFiltered(
    tenantId: string | undefined,
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    try {
      const qb = this.harvestRepository
        .createQueryBuilder('harvest')
        .leftJoinAndSelect('harvest.tenant', 'tenant')
        .leftJoinAndSelect('harvest.createdBy', 'createdBy')
        .orderBy('harvest.date', OrderDirection.DESC)
        .addOrderBy('harvest.createdAt', OrderDirection.DESC);

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      if (!filter) {
        return qb.getMany();
      }

      if (filter.tenantId) {
        qb.andWhere('harvest.tenantId = :filterTenantId', {
          filterTenantId: filter.tenantId,
        });
      }

      if (filter.createdById) {
        qb.andWhere('harvest.createdById = :createdById', {
          createdById: filter.createdById,
        });
      }

      if (filter.search?.trim()) {
        const term = `%${filter.search.trim()}%`;
        qb.andWhere(
          '(harvest.batch ILIKE :term OR harvest.species ILIKE :term OR harvest.variety ILIKE :term)',
          { term },
        );
      }

      if (filter.dateFrom) {
        qb.andWhere('harvest.date >= :dateFrom', {
          dateFrom: filter.dateFrom,
        });
      }
      if (filter.dateTo) {
        qb.andWhere('harvest.date <= :dateTo', { dateTo: filter.dateTo });
      }

      if (filter.status) {
        qb.andWhere('harvest.status = :status', { status: filter.status });
      }

      if (filter.greenhouse) {
        qb.andWhere('harvest.greenhouse = :greenhouse', {
          greenhouse: filter.greenhouse,
        });
      }

      return qb.getMany();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findAllFiltered failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch harvests');
    }
  }

  private getLegacyGroupKey(harvest: Harvest): string {
    const batch = harvest.batch.trim().toLowerCase();
    const greenhouse = (harvest.greenhouse ?? '').trim().toLowerCase();
    return `${batch}::${greenhouse}`;
  }

  async findBatchesForSelector(
    tenantId: string | undefined,
  ): Promise<HarvestBatchListItem[]> {
    try {
      const qb = this.harvestRepository
        .createQueryBuilder('harvest')
        .orderBy('harvest.createdAt', OrderDirection.ASC);

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      const rows = await qb.getMany();

      // Sum sellable yield (classA + classB) per batch, skipping placeholder
      // rows that carry no real harvest data. Child harvest entries share their
      // parent's batch key via getBatchKey.
      const sellableByBatch = new Map<string, number>();
      for (const row of rows) {
        if (this.isDashboardPlaceholder(row)) continue;
        const key = this.getBatchKey(row);
        sellableByBatch.set(
          key,
          (sellableByBatch.get(key) ?? 0) + row.classA + row.classB,
        );
      }

      const parents = rows.filter((row) => row.parentBatchId === null);
      const representatives = new Map<string, Harvest>();
      for (const row of parents) {
        const key = this.getLegacyGroupKey(row);
        if (!representatives.has(key)) representatives.set(key, row);
      }

      return Array.from(representatives.values())
        .sort(
          (a, b) =>
            new Date(b.plantingDate).getTime() -
            new Date(a.plantingDate).getTime(),
        )
        .map((h) => {
          const sellable = sellableByBatch.get(h.id) ?? 0;
          const yieldPerPlant =
            h.totalPlants > 0 ? this.roundTo2(sellable / h.totalPlants) : null;
          return {
            id: h.id,
            name: h.batch,
            species: h.species,
            variety: h.variety,
            greenhouse: h.greenhouse,
            plantingDate: h.plantingDate,
            status: h.status,
            yieldPerPlant,
          };
        });
    } catch (error) {
      this.logger.error(
        `findBatchesForSelector failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to fetch batches for selector',
      );
    }
  }

  async findOneById(id: string, tenantId?: string): Promise<Harvest> {
    try {
      const harvest = await this.findOne(id, tenantId);
      if (!harvest) {
        throw new NotFoundException(`Harvest with ID ${id} not found`);
      }
      return harvest;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findOneById failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch harvest');
    }
  }

  async findOneWithRelations(
    id: string,
    tenantId?: string,
  ): Promise<Harvest | null> {
    const qb = this.harvestRepository
      .createQueryBuilder('harvest')
      .leftJoinAndSelect('harvest.tenant', 'tenant')
      .leftJoinAndSelect('harvest.createdBy', 'createdBy')
      .where('harvest.id = :id', { id });

    if (tenantId !== undefined) {
      qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
    }

    return qb.getOne();
  }

  async createHarvest(
    input: CreateHarvestInput,
    tenantId: string,
    createdById: string,
  ): Promise<Harvest> {
    try {
      const batchName = input.batch ?? `${input.species} - ${input.variety}`;
      // When sub-entries are supplied the flat yield/brix/fruit/row fields are
      // derived from them; otherwise fall back to the flat input (legacy path).
      const agg = input.entries?.length
        ? this.aggregateEntries(input.entries)
        : null;
      const classA = agg?.classA ?? input.classA ?? 0;
      const classB = agg?.classB ?? input.classB ?? 0;
      const totalPlants = input.totalPlants ?? 0;

      const harvest = this.harvestRepository.create({
        tenantId,
        parentBatchId: input.parentBatchId ?? null,
        createdById,
        species: input.species,
        variety: input.variety,
        batch: batchName,
        // Frozen at creation: derived once from variety + planting date and never
        // regenerated when those fields are later edited (see updateHarvest).
        batchNumber: buildBatchNumber(input.variety, input.plantingDate),
        greenhouse: input.greenhouse ?? undefined,
        plantingDate: new Date(input.plantingDate),
        cultivationArea: input.cultivationArea,
        numberOfRows: input.numberOfRows,
        rowLength: input.rowLength,
        plantsPerMeter: input.plantsPerMeter,
        rowSpacing:
          input.rowSpacing ??
          this.computeRowSpacing(
            input.cultivationArea,
            input.numberOfRows,
            input.rowLength,
          ),
        totalPlants,
        lostPlants: input.lostPlants ?? 0,
        status: input.status ?? HarvestStatus.ACTIVE,
        date: new Date(input.date),
        classA,
        classB,
        waste: agg?.waste ?? input.waste ?? 0,
        yieldPerPlant: this.computeYieldPerPlant(classA, classB, totalPlants),
        avgBrix: agg?.avgBrix ?? input.avgBrix ?? 0,
        rowX:
          agg?.rowX ??
          input.rowX ??
          (input.numberOfRowsHarvested && input.numberOfRowsHarvested > 0
            ? 1
            : 0),
        rowY:
          agg?.rowY ??
          input.rowY ??
          (input.numberOfRowsHarvested && input.numberOfRowsHarvested > 0
            ? input.numberOfRowsHarvested
            : 0),
        brixReadings: agg?.brixReadings ?? input.brixReadings ?? [],
        fruitCount: agg?.fruitCount ?? input.fruitCount ?? 0,
        totalFruitWeight: agg?.totalFruitWeight ?? input.totalFruitWeight ?? 0,
        avgFruitWeight: agg?.avgFruitWeight ?? input.avgFruitWeight ?? 0,
        photos: input.photos ?? 0,
        photoUrls: input.photoUrls ?? [],
        entries: agg?.entries ?? [],
      });

      const saved = await this.harvestRepository.save(harvest);
      const result = await this.harvestRepository.findOne({
        where: { id: saved.id },
        relations: [...this.harvestRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload harvest with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `createHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create harvest');
    }
  }

  async updateHarvest(
    id: string,
    input: UpdateHarvestInput,
    tenantId?: string,
  ): Promise<Harvest> {
    try {
      const harvest = await this.findOneById(id, tenantId);

      if (input.species !== undefined) harvest.species = input.species;
      if (input.variety !== undefined) harvest.variety = input.variety;
      if (input.batch !== undefined) harvest.batch = input.batch;
      if (input.parentBatchId !== undefined) {
        harvest.parentBatchId = input.parentBatchId;
      }
      if (input.greenhouse !== undefined) harvest.greenhouse = input.greenhouse;
      if (input.plantingDate !== undefined) {
        harvest.plantingDate = new Date(input.plantingDate);
      }
      if (input.cultivationArea !== undefined)
        harvest.cultivationArea = input.cultivationArea;
      if (input.numberOfRows !== undefined)
        harvest.numberOfRows = input.numberOfRows;
      if (input.rowLength !== undefined) harvest.rowLength = input.rowLength;
      if (input.plantsPerMeter !== undefined) {
        harvest.plantsPerMeter = input.plantsPerMeter;
      }
      if (input.rowSpacing !== undefined) {
        harvest.rowSpacing = input.rowSpacing;
      } else if (
        input.cultivationArea !== undefined ||
        input.numberOfRows !== undefined ||
        input.rowLength !== undefined
      ) {
        harvest.rowSpacing = this.computeRowSpacing(
          harvest.cultivationArea,
          harvest.numberOfRows,
          harvest.rowLength,
        );
      }
      if (input.totalPlants !== undefined)
        harvest.totalPlants = input.totalPlants;
      if (input.lostPlants !== undefined) harvest.lostPlants = input.lostPlants;
      if (input.status !== undefined) harvest.status = input.status;
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.classA !== undefined) harvest.classA = input.classA;
      if (input.classB !== undefined) harvest.classB = input.classB;
      if (input.waste !== undefined) harvest.waste = input.waste;
      harvest.yieldPerPlant = this.computeYieldPerPlant(
        harvest.classA,
        harvest.classB,
        harvest.totalPlants,
      );
      if (input.avgBrix !== undefined) harvest.avgBrix = input.avgBrix;
      if (input.rowX !== undefined) harvest.rowX = input.rowX;
      if (input.rowY !== undefined) harvest.rowY = input.rowY;
      if (
        input.numberOfRowsHarvested !== undefined &&
        input.rowX === undefined &&
        input.rowY === undefined
      ) {
        harvest.rowX = input.numberOfRowsHarvested > 0 ? 1 : 0;
        harvest.rowY =
          input.numberOfRowsHarvested > 0 ? input.numberOfRowsHarvested : 0;
      }
      if (input.brixReadings !== undefined) {
        harvest.brixReadings = input.brixReadings;
      }
      if (input.fruitCount !== undefined) {
        harvest.fruitCount = input.fruitCount;
      }
      if (input.totalFruitWeight !== undefined) {
        harvest.totalFruitWeight = input.totalFruitWeight;
      }
      if (input.avgFruitWeight !== undefined) {
        harvest.avgFruitWeight = input.avgFruitWeight;
      }
      if (input.photos !== undefined) harvest.photos = input.photos;
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

      // Sub-entries are authoritative when supplied: re-derive every flat
      // aggregate from them (overriding any flat fields above) and recompute
      // yieldPerPlant from the aggregated sellable yield. An explicit empty
      // array clears the breakdown without touching the flat fields.
      if (input.entries !== undefined) {
        if (input.entries.length > 0) {
          const agg = this.aggregateEntries(input.entries);
          harvest.entries = agg.entries;
          harvest.classA = agg.classA;
          harvest.classB = agg.classB;
          harvest.waste = agg.waste;
          harvest.avgBrix = agg.avgBrix;
          harvest.brixReadings = agg.brixReadings;
          harvest.fruitCount = agg.fruitCount;
          harvest.totalFruitWeight = agg.totalFruitWeight;
          harvest.avgFruitWeight = agg.avgFruitWeight;
          harvest.rowX = agg.rowX;
          harvest.rowY = agg.rowY;
          harvest.yieldPerPlant = this.computeYieldPerPlant(
            harvest.classA,
            harvest.classB,
            harvest.totalPlants,
          );
        } else {
          harvest.entries = [];
        }
      }

      const saved = await this.harvestRepository.save(harvest);
      const result = await this.harvestRepository.findOne({
        where: { id: saved.id },
        relations: [...this.harvestRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload harvest with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `updateHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update harvest');
    }
  }

  async deleteHarvest(id: string, tenantId?: string): Promise<void> {
    try {
      await this.findOneById(id, tenantId);
      await this.delete(id, tenantId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `deleteHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete harvest');
    }
  }

  async getDashboardMetrics(
    tenantId: string | undefined,
    filter?: DashboardFilterInput | null,
  ): Promise<HarvestDashboardMetrics> {
    try {
      const qb = this.harvestRepository.createQueryBuilder('harvest');

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      if (filter) {
        if (filter.tenantId) {
          qb.andWhere('harvest.tenantId = :filterTenantId', {
            filterTenantId: filter.tenantId,
          });
        }
        if (filter.species) {
          qb.andWhere('harvest.species ILIKE :species', {
            species: `%${filter.species}%`,
          });
        }
        if (filter.variety) {
          qb.andWhere('harvest.variety ILIKE :variety', {
            variety: `%${filter.variety}%`,
          });
        }
        if (filter.batch) {
          qb.andWhere('harvest.batch ILIKE :batch', {
            batch: `%${filter.batch}%`,
          });
        }
        if (filter.batchId) {
          const representative = await this.harvestRepository.findOne({
            where: { id: filter.batchId },
          });
          if (representative) {
            qb.andWhere(
              `(
                harvest.id = :batchId
                OR harvest.parentBatchId = :batchId
                OR (
                  harvest.parentBatchId IS NULL
                  AND LOWER(TRIM(harvest.batch)) = :legacyBatchName
                  AND LOWER(TRIM(COALESCE(harvest.greenhouse, ''))) = :legacyGreenhouse
                )
              )`,
              {
                batchId: filter.batchId,
                legacyBatchName: representative.batch.trim().toLowerCase(),
                legacyGreenhouse: (representative.greenhouse ?? '')
                  .trim()
                  .toLowerCase(),
              },
            );
          } else {
            qb.andWhere('1 = 0');
          }
        }
        if (filter.dateFrom) {
          qb.andWhere('harvest.date >= :dateFrom', {
            dateFrom: filter.dateFrom,
          });
        }
        if (filter.dateTo) {
          qb.andWhere('harvest.date <= :dateTo', {
            dateTo: filter.dateTo,
          });
        }
        if (filter.greenhouse) {
          qb.andWhere('harvest.greenhouse = :greenhouse', {
            greenhouse: filter.greenhouse,
          });
        }
      }

      qb.orderBy('harvest.date', OrderDirection.ASC);
      const harvests = await qb.getMany();
      const metricsHarvests = harvests.filter(
        (harvest) => !this.isDashboardPlaceholder(harvest),
      );

      if (metricsHarvests.length === 0) {
        return this.getEmptyDashboardMetrics();
      }

      // Get primary species and variety (most common)
      const speciesMap = new Map<string, number>();
      const varietyMap = new Map<string, number>();

      metricsHarvests.forEach((h) => {
        speciesMap.set(h.species, (speciesMap.get(h.species) || 0) + 1);
        varietyMap.set(h.variety, (varietyMap.get(h.variety) || 0) + 1);
      });

      const primarySpecies = [...speciesMap.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      const primaryVariety = [...varietyMap.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0][0];

      // Calculate metrics
      const totalClassA = metricsHarvests.reduce((sum, h) => sum + h.classA, 0);
      const totalWaste = metricsHarvests.reduce((sum, h) => sum + h.waste, 0);
      const totalClassB = metricsHarvests.reduce((sum, h) => sum + h.classB, 0);
      const totalYield = totalClassA + totalWaste;

      const marketablePercent =
        totalYield > 0 ? (totalClassA / totalYield) * 100 : 0;
      const wastePercent = totalYield > 0 ? (totalWaste / totalYield) * 100 : 0;

      // Calculate average brix
      const validBrixHarvests = metricsHarvests.filter((h) => h.avgBrix > 0);
      const averageBrix =
        validBrixHarvests.length > 0
          ? validBrixHarvests.reduce((sum, h) => sum + h.avgBrix, 0) /
            validBrixHarvests.length
          : 0;

      // Calculate average fruit weight: mean of each row's avg, derived live
      // from current yield + fruit count. Rows without a measurement don't
      // contribute.
      const perRowAvgFruitWeights = metricsHarvests
        .map((h) => this.computeRowAvgFruitWeight(h))
        .filter((v): v is number => v !== null);
      const averageFruitWeight =
        perRowAvgFruitWeights.length > 0
          ? perRowAvgFruitWeights.reduce((sum, v) => sum + v, 0) /
            perRowAvgFruitWeights.length
          : 0;

      // Yield per plant: Σ (classA + classB) / Σ totalPlants, weighted by batch.
      // totalPlants lives on the parent batch row only (children default to 0),
      // so we read it from the unfiltered `harvests` list — a parent row that's
      // currently a dashboard placeholder still owns the batch's plant count.
      const totalPlantsByBatch = new Map<string, number>();
      for (const h of harvests) {
        if (h.parentBatchId === null) {
          totalPlantsByBatch.set(h.id, h.totalPlants);
        }
      }
      const sellableByBatch = new Map<string, number>();
      for (const h of metricsHarvests) {
        const key = this.getBatchKey(h);
        sellableByBatch.set(
          key,
          (sellableByBatch.get(key) ?? 0) + h.classA + h.classB,
        );
      }
      let sumSellable = 0;
      let sumPlants = 0;
      for (const [batchId, sellable] of sellableByBatch) {
        const plants = totalPlantsByBatch.get(batchId) ?? 0;
        if (plants > 0) {
          sumSellable += sellable;
          sumPlants += plants;
        }
      }
      const yieldPerPlant =
        sumPlants > 0 ? this.roundTo2(sumSellable / sumPlants) : null;

      // Calculate days active (from earliest planting date to latest harvest date)
      const plantingDates = metricsHarvests.map(
        (h) => new Date(h.plantingDate),
      );
      const harvestDates = metricsHarvests.map((h) => new Date(h.date));
      const earliestPlanting = new Date(
        Math.min(...plantingDates.map((d) => d.getTime())),
      );
      const latestHarvest = new Date(
        Math.max(...harvestDates.map((d) => d.getTime())),
      );
      const daysActive = Math.ceil(
        (latestHarvest.getTime() - earliestPlanting.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Critical alerts (harvests with low brix or high waste percentage)
      const criticalAlerts = metricsHarvests.filter(
        (h) => h.avgBrix < 6.0 || h.waste / (h.classA + h.waste) > 0.15,
      ).length;

      // Generate time series data
      const yieldOverTime = this.generateYieldOverTimeData(metricsHarvests);
      const classDistribution =
        this.generateClassDistributionData(metricsHarvests);
      const brixTrend = this.generateBrixTrendData(metricsHarvests);
      const fruitWeightTrend =
        this.generateFruitWeightTrendData(metricsHarvests);
      const cumulativeYield = this.generateCumulativeYieldData(metricsHarvests);

      return {
        species: primarySpecies,
        variety: primaryVariety,
        harvestCount: metricsHarvests.length,
        totalYield: Math.round(totalYield * 10) / 10,
        averageBrix: Math.round(averageBrix * 10) / 10,
        averageFruitWeight: Math.round(averageFruitWeight * 1000) / 1000,
        yieldPerPlant,
        marketablePercent: Math.round(marketablePercent * 10) / 10,
        wastePercent: Math.round(wastePercent * 10) / 10,
        wasteTotal: Math.round(totalWaste * 10) / 10,
        classBTotal: Math.round(totalClassB * 10) / 10,
        criticalAlerts,
        daysActive,
        yieldOverTime,
        classDistribution,
        brixTrend,
        fruitWeightTrend,
        cumulativeYield,
      };
    } catch (error) {
      this.logger.error(
        `getDashboardMetrics failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to fetch dashboard metrics',
      );
    }
  }

  private getEmptyDashboardMetrics(): HarvestDashboardMetrics {
    return {
      species: 'N/A',
      variety: 'N/A',
      harvestCount: 0,
      totalYield: 0,
      averageBrix: 0,
      averageFruitWeight: 0,
      yieldPerPlant: null,
      marketablePercent: 0,
      wastePercent: 0,
      wasteTotal: 0,
      classBTotal: 0,
      criticalAlerts: 0,
      daysActive: 0,
      yieldOverTime: [],
      classDistribution: [],
      brixTrend: [],
      fruitWeightTrend: [],
      cumulativeYield: [],
    };
  }

  private generateYieldOverTimeData(harvests: Harvest[]): YieldOverTimeData[] {
    const dailyYield = new Map<string, number>();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const currentYield = dailyYield.get(dateStr) || 0;
      dailyYield.set(dateStr, currentYield + harvest.classA);
    });

    return Array.from(dailyYield.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, yieldAmount]) => ({
        date,
        yield: Math.round(yieldAmount * 10) / 10,
      }));
  }

  private generateClassDistributionData(
    harvests: Harvest[],
  ): ClassDistributionData[] {
    const dailyData = new Map<
      string,
      { classA: number; classB: number; waste: number }
    >();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const current = dailyData.get(dateStr) || {
        classA: 0,
        classB: 0,
        waste: 0,
      };
      dailyData.set(dateStr, {
        classA: current.classA + harvest.classA,
        classB: current.classB + harvest.classB,
        waste: current.waste + harvest.waste,
      });
    });

    return Array.from(dailyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        marketable: Math.round(data.classA * 10) / 10,
        classB: Math.round(data.classB * 10) / 10,
        waste: Math.round(data.waste * 10) / 10,
      }));
  }

  private generateBrixTrendData(harvests: Harvest[]): BrixTrendData[] {
    const dailyBrix = new Map<string, { total: number; count: number }>();

    harvests.forEach((harvest) => {
      if (harvest.avgBrix > 0) {
        const dateStr = harvest.date.toISOString().split('T')[0];
        const current = dailyBrix.get(dateStr) || { total: 0, count: 0 };
        dailyBrix.set(dateStr, {
          total: current.total + harvest.avgBrix,
          count: current.count + 1,
        });
      }
    });

    return Array.from(dailyBrix.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        brix: Math.round((data.total / data.count) * 10) / 10,
      }));
  }

  private generateFruitWeightTrendData(
    harvests: Harvest[],
  ): FruitWeightTrendData[] {
    const dailyWeight = new Map<string, { total: number; count: number }>();

    harvests.forEach((harvest) => {
      const avg = this.computeRowAvgFruitWeight(harvest);
      if (avg !== null) {
        const dateStr = harvest.date.toISOString().split('T')[0];
        const current = dailyWeight.get(dateStr) || { total: 0, count: 0 };
        dailyWeight.set(dateStr, {
          total: current.total + avg,
          count: current.count + 1,
        });
      }
    });

    return Array.from(dailyWeight.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        weight: Math.round((data.total / data.count) * 1000) / 1000,
      }));
  }

  private generateCumulativeYieldData(
    harvests: Harvest[],
  ): CumulativeYieldData[] {
    const dailyData = new Map<
      string,
      { classA: number; classB: number; waste: number }
    >();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const current = dailyData.get(dateStr) || {
        classA: 0,
        classB: 0,
        waste: 0,
      };
      dailyData.set(dateStr, {
        classA: current.classA + harvest.classA,
        classB: current.classB + harvest.classB,
        waste: current.waste + harvest.waste,
      });
    });

    const sortedEntries = Array.from(dailyData.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let cumulativeClassA = 0;
    let cumulativeClassB = 0;
    let cumulativeWaste = 0;

    return sortedEntries.map(([date, data]) => {
      cumulativeClassA += data.classA;
      cumulativeClassB += data.classB;
      cumulativeWaste += data.waste;
      return {
        date,
        cumulativeClassA: Math.round(cumulativeClassA * 10) / 10,
        cumulativeClassB: Math.round(cumulativeClassB * 10) / 10,
        cumulativeWaste: Math.round(cumulativeWaste * 10) / 10,
      };
    });
  }
}

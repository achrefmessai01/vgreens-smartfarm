import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { HarvestEntry } from './entities/harvest-entry.entity';
import { BrixReading } from './entities/brix-reading';
import { CreateHarvestInput } from './dto/create-harvest.input';
import { UpdateHarvestInput } from './dto/update-harvest.input';
import { HarvestEntryInput } from './dto/harvest-entry.input';
import { HarvestFilterInput } from './dto/harvest-filter.input';
import { DashboardFilterInput } from './dto/dashboard-filter.input';
import { HarvestTotals } from './dto/harvest-totals.dto';
import { HarvestBatchListItem } from './dto/harvest-batch-list-item.dto';
import {
  HarvestDashboardMetrics,
  YieldOverTimeData,
  YieldPerMeterData,
  ClassDistributionData,
  BrixTrendData,
  FruitWeightTrendData,
  CumulativeYieldData,
} from './dto/dashboard-metrics.dto';
import { OrderDirection, InputMode } from '@common/enums';
import { Batch } from '@modules/batch/entities/batch.entity';
import { BatchService } from '@modules/batch/batch.service';

// A harvest paired with its derived totals — the unit dashboard aggregation
// works over.
interface HarvestWithTotals {
  harvest: Harvest;
  totals: HarvestTotals;
}

@Injectable()
export class HarvestsService {
  private readonly logger = new Logger(HarvestsService.name);

  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
    @InjectRepository(HarvestEntry)
    private readonly entryRepository: Repository<HarvestEntry>,
    private readonly batchService: BatchService,
  ) {}

  // tenant + batch + greenhouse + entries + creator: everything the totals,
  // dashboard and CSV need without a second round trip.
  private withRelations(alias = 'harvest') {
    return this.harvestRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.batch`, 'batch')
      .leftJoinAndSelect('batch.greenhouse', 'greenhouse')
      .leftJoinAndSelect('batch.crop', 'crop')
      .leftJoinAndSelect('batch.variety', 'variety')
      .leftJoinAndSelect(`${alias}.entries`, 'entries')
      .leftJoinAndSelect(`${alias}.tenant`, 'tenant')
      .leftJoinAndSelect(`${alias}.createdBy`, 'createdBy');
  }

  // Minutes since midnight from a wall-clock time string ('HH:mm' or the
  // 'HH:mm:ss' Postgres returns). Seconds are ignored — inputs are HH:mm.
  private timeToMinutes(value: string): number {
    const [h, m] = value.split(':');
    return Number(h) * 60 + Number(m);
  }

  // Harvest-level timing rules, enforced server-side against the FINAL state
  // (so an update that sets only one side is validated against what is stored):
  //  - both startTime and stopTime present, or both absent (no half sessions);
  //  - stopTime strictly after startTime (a harvest takes nonzero time).
  // Times are same-day wall-clock — a session never crosses midnight.
  private validateTiming(
    startTime: string | null | undefined,
    stopTime: string | null | undefined,
  ): void {
    const start = startTime == null || startTime === '' ? null : startTime;
    const stop = stopTime == null || stopTime === '' ? null : stopTime;
    if ((start === null) !== (stop === null)) {
      throw new BadRequestException(
        'startTime and stopTime must both be set or both be empty',
      );
    }
    if (
      start !== null &&
      stop !== null &&
      this.timeToMinutes(stop) <= this.timeToMinutes(start)
    ) {
      throw new BadRequestException('stopTime must be after startTime');
    }
  }

  private roundTo(value: number, decimals: number): number {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
  }

  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
  }

  // Mean of a single entry's brix values. Empty -> 0.
  private entryAvgBrix(brixReadings: BrixReading[]): number {
    if (!brixReadings.length) return 0;
    return this.roundTo(this.mean(brixReadings.map((b) => b.value)), 1);
  }

  // Quality-class label from a 0-based array index: 0 -> A, 1 -> B, 2 -> C, ...
  // The classes are positional and unbounded; the letter is derived, never taken
  // from a fixed enum.
  private classLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Non-blocking sanity check for crate-mode input: a per-class remainder at or
  // above a full crate weight means another crate should probably have been
  // counted. Logged, never rejected.
  private warnCrateRemainder(input: HarvestEntryInput, batch: Batch): void {
    if (batch.inputMode !== InputMode.CRATE) return;
    const crateWeight = batch.crateWeight ?? 0;
    if (crateWeight <= 0) return;
    (input.remainingKgs ?? []).forEach((remainder, i) => {
      if ((remainder ?? 0) >= crateWeight) {
        this.logger.warn(
          `Crate entry remainingKg[${this.classLetter(i)}]=${remainder} >= crateWeight=${crateWeight} (batch ${batch.id}); that is another full crate.`,
        );
      }
    });
  }

  // Build a persistable entry from input, filling the two derived per-entry
  // fields (avgFruitWeight, avgBrix) — the service is the source of truth for
  // these, never the client.
  //
  // Both modes store per-quality arrays now: weight mode the kg directly
  // (classKgs), crate mode the counts + remainders (kg derived at read from the
  // batch's current crateWeight, so a crateWeight edit propagates). The derived
  // fields (totalFruitWeight, avgFruitWeight) are always computed at read via the
  // helpers below and left 0 in storage.
  private buildEntry(
    input: HarvestEntryInput,
    batch: Batch,
  ): DeepPartial<HarvestEntry> {
    const brixReadings: BrixReading[] = (input.brixReadings ?? []).map((b) => ({
      class: b.class,
      value: b.value,
    }));

    const common = {
      rowX: input.rowX ?? 0,
      rowY: input.rowY ?? 0,
      waste: input.waste ?? 0,
      // Derived at read (avgFruitWeight from the sample below); stored 0.
      totalFruitWeight: 0,
      avgFruitWeight: 0,
      // Sample-based fruit weight: the sample's mass (g) and its fruit count.
      sampleWeight: input.sampleWeight ?? null,
      sampleFruitCount: input.sampleFruitCount ?? null,
      brixReadings,
      avgBrix: this.entryAvgBrix(brixReadings),
    };

    if (batch.inputMode === InputMode.CRATE) {
      return {
        ...common,
        crateCounts: input.crateCounts ?? [],
        remainingKgs: input.remainingKgs ?? [],
      };
    }
    return { ...common, classKgs: input.classKgs ?? [] };
  }

  // Number of quality classes an entry carries (per-entry, dynamic).
  private entryClassCount(
    e: HarvestEntry,
    batch: Batch | null | undefined,
  ): number {
    return batch?.inputMode === InputMode.CRATE
      ? (e.crateCounts?.length ?? 0)
      : (e.classKgs?.length ?? 0);
  }

  // Effective sellable kg for one quality class by 0-based index. Crate mode
  // derives it from the batch's current crateWeight (count × crateWeight +
  // remainder); weight mode reads the stored class kg. Single source of truth —
  // every total flows through here.
  private entryClassKg(
    e: HarvestEntry,
    batch: Batch | null | undefined,
    index: number,
  ): number {
    if (batch?.inputMode === InputMode.CRATE) {
      const count = e.crateCounts?.[index] ?? 0;
      const remainder = e.remainingKgs?.[index] ?? 0;
      return count * (batch.crateWeight ?? 0) + remainder;
    }
    return e.classKgs?.[index] ?? 0;
  }

  // Effective total sellable weight for an entry: the sum across ALL quality
  // classes present (dynamic, unbounded), in either mode.
  private entryTotalWeight(
    e: HarvestEntry,
    batch: Batch | null | undefined,
  ): number {
    const n = this.entryClassCount(e, batch);
    let total = 0;
    for (let i = 0; i < n; i++) total += this.entryClassKg(e, batch, i);
    return total;
  }

  // Average fruit weight in GRAMS per fruit, from the weighed sample
  // (sampleWeight g / sampleFruitCount). Returns null when the sample is missing
  // or incomplete, so such an entry is excluded from the mean rather than
  // dragging it toward 0.
  private entryAvgFruitWeight(e: HarvestEntry): number | null {
    const sampleCount = e.sampleFruitCount ?? 0;
    if (e.sampleWeight != null && e.sampleWeight > 0 && sampleCount > 0) {
      return this.roundTo(e.sampleWeight / sampleCount, 3);
    }
    return null;
  }

  // Derive a harvest's totals from its entries (+ parent batch for the yields).
  // This is exactly what the omitted DB view would have produced.
  //
  // NOTE: avgFruitWeight (now GRAMS per fruit) and avgBrix are the UNWEIGHTED
  // mean of the per-entry averages, skipping entries with no value. fruitCount is
  // the SUM of the per-entry sampleFruitCount — i.e. the total number of fruits
  // SAMPLED, not an estimate of the total fruits harvested. If a weighted mean is
  // wanted later, change it here.
  computeTotals(
    entries: HarvestEntry[] | undefined,
    batch?: Batch | null,
  ): HarvestTotals {
    const list = entries ?? [];
    const sum = (pick: (e: HarvestEntry) => number): number =>
      list.reduce((s, e) => s + (pick(e) || 0), 0);

    // Per-class sellable kg, summed across entries through the effective-weight
    // helper (so crate-mode entries reflect the batch's current crateWeight). The
    // array is as wide as the widest entry — class count is per-entry and dynamic.
    const classN = Math.max(
      0,
      ...list.map((e) => this.entryClassCount(e, batch)),
    );
    const classKgs = Array.from({ length: classN }, (_, i) =>
      this.roundTo(
        sum((e) => this.entryClassKg(e, batch, i)),
        3,
      ),
    );
    // Convenience scalars for the first three classes (CSV / summary / compare).
    const classA = classKgs[0] ?? 0;
    const classB = classKgs[1] ?? 0;
    const classC = classKgs[2] ?? 0;
    const waste = this.roundTo(
      sum((e) => e.waste),
      3,
    );
    // Total fruits SAMPLED across the entries (sum of each sample's fruit count),
    // not an estimate of the total fruits harvested.
    const fruitCount = sum((e) => e.sampleFruitCount ?? 0);
    const totalFruitWeight = this.roundTo(
      sum((e) => this.entryTotalWeight(e, batch)),
      3,
    );

    // Crate-count rollups are meaningful only for crate-mode batches. Dynamic
    // length: as wide as the widest entry's crateCounts (index 0=A, 1=B, ...).
    const isCrate = batch?.inputMode === InputMode.CRATE;
    const crateClassN = isCrate
      ? Math.max(0, ...list.map((e) => e.crateCounts?.length ?? 0))
      : 0;
    const crateCounts = isCrate
      ? Array.from({ length: crateClassN }, (_, i) =>
          sum((e) => e.crateCounts?.[i] ?? 0),
        )
      : null;

    const hasEntries = list.length > 0;
    // Unweighted mean of the per-entry g/fruit averages, ignoring entries that
    // have no computable average (incomplete sample / no legacy count).
    const avgValues = list
      .map((e) => this.entryAvgFruitWeight(e))
      .filter((v): v is number => v != null);
    const avgFruitWeight =
      avgValues.length > 0 ? this.roundTo(this.mean(avgValues), 3) : null;
    const avgBrix = hasEntries
      ? this.roundTo(this.mean(list.map((e) => e.avgBrix || 0)), 1)
      : null;

    const totalPlants = batch?.totalPlants ?? 0;
    const rowLength = batch?.rowLength ?? 0;
    // Null-safe: never divide by a zero/missing denominator.
    const yieldPerPlant =
      totalPlants > 0 ? this.roundTo(totalFruitWeight / totalPlants, 3) : null;
    const yieldPerMeter =
      rowLength > 0 ? this.roundTo(totalFruitWeight / rowLength, 3) : null;

    return {
      classKgs,
      classA,
      classB,
      classC,
      waste,
      fruitCount,
      totalFruitWeight,
      crateCounts,
      avgFruitWeight,
      avgBrix,
      yieldPerPlant,
      yieldPerMeter,
    };
  }

  async findAllFiltered(
    tenantId: string | undefined,
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    try {
      const qb = this.withRelations()
        .orderBy('harvest.date', OrderDirection.DESC)
        .addOrderBy('harvest.createdAt', OrderDirection.DESC);

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      if (filter) {
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
        if (filter.batchId) {
          qb.andWhere('harvest.batchId = :batchId', {
            batchId: filter.batchId,
          });
        }
        if (filter.greenhouseId) {
          qb.andWhere('batch.greenhouseId = :greenhouseId', {
            greenhouseId: filter.greenhouseId,
          });
        }
        if (filter.status) {
          qb.andWhere('batch.status = :status', { status: filter.status });
        }
        if (filter.search?.trim()) {
          const term = `%${filter.search.trim()}%`;
          qb.andWhere(
            '(batch.name ILIKE :term OR crop.name ILIKE :term OR variety.name ILIKE :term)',
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
      }

      return await qb.getMany();
    } catch (error) {
      this.logger.error(
        `findAllFiltered failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch harvests');
    }
  }

  async findAllForExport(
    tenantId: string | undefined,
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    const harvests = await this.findAllFiltered(tenantId, filter);
    // Populate the resolved totals so the CSV serializer can read them.
    for (const h of harvests) {
      h.totals = this.computeTotals(h.entries, h.batch);
    }
    return harvests;
  }

  async findOneWithRelations(
    id: string,
    tenantId?: string,
  ): Promise<Harvest | null> {
    const qb = this.withRelations().where('harvest.id = :id', { id });
    if (tenantId !== undefined) {
      qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
    }
    return qb.getOne();
  }

  async findOneById(id: string, tenantId?: string): Promise<Harvest> {
    const harvest = await this.findOneWithRelations(id, tenantId);
    if (!harvest) {
      throw new NotFoundException(`Harvest with ID ${id} not found`);
    }
    return harvest;
  }

  async createHarvest(
    input: CreateHarvestInput,
    tenantId: string,
    createdById: string,
  ): Promise<Harvest> {
    try {
      // Validates the batch exists and belongs to the tenant; also gives us the
      // mode + crateWeight needed to build crate-mode entries.
      const batch = await this.batchService.findOneById(
        input.batchId,
        tenantId,
      );
      (input.entries ?? []).forEach((e) => this.warnCrateRemainder(e, batch));

      this.validateTiming(input.startTime, input.stopTime);

      const harvest = this.harvestRepository.create({
        tenantId,
        batchId: input.batchId,
        createdById,
        date: new Date(input.date),
        startTime: input.startTime ?? null,
        stopTime: input.stopTime ?? null,
        harvesterHeadCount: input.harvesterHeadCount ?? null,
        photoUrls: input.photoUrls ?? [],
        entries: (input.entries ?? []).map((e) => this.buildEntry(e, batch)),
      });

      const saved = await this.harvestRepository.save(harvest);
      return this.findOneById(saved.id, tenantId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
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

      // Resolve the batch we'll build entries against: the new one if the
      // harvest is being reassigned, otherwise the already-loaded parent.
      let batch = harvest.batch ?? null;
      if (input.batchId !== undefined) {
        batch = await this.batchService.findOneById(input.batchId, tenantId);
        harvest.batchId = input.batchId;
      }
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

      // Validate timing against the merged (final) state: a field left out of
      // the input keeps its stored value; an explicit null clears it.
      const nextStartTime =
        input.startTime !== undefined ? input.startTime : harvest.startTime;
      const nextStopTime =
        input.stopTime !== undefined ? input.stopTime : harvest.stopTime;
      this.validateTiming(nextStartTime, nextStopTime);
      if (input.startTime !== undefined) harvest.startTime = input.startTime;
      if (input.stopTime !== undefined) harvest.stopTime = input.stopTime;
      if (input.harvesterHeadCount !== undefined) {
        harvest.harvesterHeadCount = input.harvesterHeadCount;
      }

      await this.harvestRepository.save(harvest);

      // Entries are authoritative when supplied: replace the whole set.
      if (input.entries !== undefined) {
        await this.entryRepository.delete({ harvestId: id });
        if (input.entries.length > 0) {
          if (!batch) {
            batch = await this.batchService.findOneById(
              harvest.batchId,
              tenantId,
            );
          }
          const resolvedBatch = batch;
          input.entries.forEach((e) =>
            this.warnCrateRemainder(e, resolvedBatch),
          );
          const entries = input.entries.map((e) =>
            this.entryRepository.create({
              ...this.buildEntry(e, resolvedBatch),
              harvestId: id,
            }),
          );
          await this.entryRepository.save(entries);
        }
      }

      return this.findOneById(id, tenantId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `updateHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update harvest');
    }
  }

  async deleteHarvest(
    id: string,
    deletedById: string,
    tenantId?: string,
  ): Promise<void> {
    try {
      const harvest = await this.findOneById(id, tenantId);
      harvest.deletedById = deletedById;
      await this.harvestRepository.save(harvest);
      await this.harvestRepository.softDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `deleteHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete harvest');
    }
  }

  // Batch selector list: every batch in scope, with kg/plant derived from the
  // sum of its harvest entries' totalFruitWeight.
  async findBatchesForSelector(
    tenantId: string | undefined,
  ): Promise<HarvestBatchListItem[]> {
    const batches = await this.batchService.findAllScoped(tenantId);
    const harvests = await this.findAllFiltered(tenantId);

    const weightByBatch = new Map<string, number>();
    for (const h of harvests) {
      // entryTotalWeight reads crate-mode entries off the batch's crateWeight;
      // findAllFiltered already joins h.batch.
      const weight = (h.entries ?? []).reduce(
        (s, e) => s + this.entryTotalWeight(e, h.batch),
        0,
      );
      weightByBatch.set(
        h.batchId,
        (weightByBatch.get(h.batchId) ?? 0) + weight,
      );
    }

    return batches.map((b) => {
      const weight = weightByBatch.get(b.id) ?? 0;
      return {
        id: b.id,
        name: b.name ?? '',
        species: b.crop?.name,
        variety: b.variety?.name,
        greenhouse: b.greenhouse?.name,
        plantingDate: b.plantingDate,
        status: b.status,
        yieldPerPlant:
          b.totalPlants > 0 ? this.roundTo(weight / b.totalPlants, 3) : null,
      };
    });
  }

  async getDashboardMetrics(
    tenantId: string | undefined,
    filter?: DashboardFilterInput | null,
  ): Promise<HarvestDashboardMetrics> {
    try {
      const qb = this.withRelations().orderBy(
        'harvest.date',
        OrderDirection.ASC,
      );

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }
      if (filter) {
        if (filter.tenantId) {
          qb.andWhere('harvest.tenantId = :filterTenantId', {
            filterTenantId: filter.tenantId,
          });
        }
        if (filter.batchId) {
          qb.andWhere('harvest.batchId = :batchId', {
            batchId: filter.batchId,
          });
        }
        if (filter.greenhouseId) {
          qb.andWhere('batch.greenhouseId = :greenhouseId', {
            greenhouseId: filter.greenhouseId,
          });
        }
        if (filter.species) {
          qb.andWhere('crop.name ILIKE :species', {
            species: `%${filter.species}%`,
          });
        }
        if (filter.variety) {
          qb.andWhere('variety.name ILIKE :variety', {
            variety: `%${filter.variety}%`,
          });
        }
        if (filter.batch) {
          qb.andWhere('batch.name ILIKE :batch', {
            batch: `%${filter.batch}%`,
          });
        }
        if (filter.dateFrom) {
          qb.andWhere('harvest.date >= :dateFrom', {
            dateFrom: filter.dateFrom,
          });
        }
        if (filter.dateTo) {
          qb.andWhere('harvest.date <= :dateTo', { dateTo: filter.dateTo });
        }
      }

      const harvests = await qb.getMany();
      const items: HarvestWithTotals[] = harvests.map((harvest) => ({
        harvest,
        totals: this.computeTotals(harvest.entries, harvest.batch),
      }));

      if (items.length === 0) {
        return this.getEmptyDashboardMetrics();
      }

      // Primary species/variety (most common across the batches in scope).
      const speciesMap = new Map<string, number>();
      const varietyMap = new Map<string, number>();
      for (const { harvest } of items) {
        const species = harvest.batch?.crop?.name ?? 'N/A';
        const variety = harvest.batch?.variety?.name ?? 'N/A';
        speciesMap.set(species, (speciesMap.get(species) ?? 0) + 1);
        varietyMap.set(variety, (varietyMap.get(variety) ?? 0) + 1);
      }
      const topKey = (m: Map<string, number>): string =>
        [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];

      const totalClassA = items.reduce((s, i) => s + i.totals.classA, 0);
      const totalClassB = items.reduce((s, i) => s + i.totals.classB, 0);
      const totalClassC = items.reduce((s, i) => s + i.totals.classC, 0);
      const totalWaste = items.reduce((s, i) => s + i.totals.waste, 0);
      const totalSellable = totalClassA + totalClassB + totalClassC;
      const totalYield = totalSellable + totalWaste;

      const marketablePercent =
        totalYield > 0 ? (totalSellable / totalYield) * 100 : 0;
      const wastePercent = totalYield > 0 ? (totalWaste / totalYield) * 100 : 0;

      const brixValues = items
        .map((i) => i.totals.avgBrix)
        .filter((v): v is number => v !== null && v > 0);
      const averageBrix = brixValues.length > 0 ? this.mean(brixValues) : 0;

      const fwValues = items
        .map((i) => i.totals.avgFruitWeight)
        .filter((v): v is number => v !== null && v > 0);
      const averageFruitWeight = fwValues.length > 0 ? this.mean(fwValues) : 0;

      // Weighted yields: Σ totalFruitWeight / Σ (batch denominator), grouped by
      // batch so each batch's plant count / row length is counted once.
      const fruitWeightByBatch = new Map<string, number>();
      const plantsByBatch = new Map<string, number>();
      const rowLengthByBatch = new Map<string, number>();
      for (const { harvest, totals } of items) {
        const batchId = harvest.batchId;
        fruitWeightByBatch.set(
          batchId,
          (fruitWeightByBatch.get(batchId) ?? 0) + totals.totalFruitWeight,
        );
        if (harvest.batch) {
          plantsByBatch.set(batchId, harvest.batch.totalPlants ?? 0);
          rowLengthByBatch.set(batchId, harvest.batch.rowLength ?? 0);
        }
      }
      let sumWeightPlants = 0;
      let sumPlants = 0;
      let sumWeightMeters = 0;
      let sumRowLength = 0;
      for (const [batchId, weight] of fruitWeightByBatch) {
        const plants = plantsByBatch.get(batchId) ?? 0;
        if (plants > 0) {
          sumWeightPlants += weight;
          sumPlants += plants;
        }
        const rowLength = rowLengthByBatch.get(batchId) ?? 0;
        if (rowLength > 0) {
          sumWeightMeters += weight;
          sumRowLength += rowLength;
        }
      }
      const yieldPerPlant =
        sumPlants > 0 ? this.roundTo(sumWeightPlants / sumPlants, 3) : null;
      const yieldPerMeter =
        sumRowLength > 0
          ? this.roundTo(sumWeightMeters / sumRowLength, 3)
          : null;

      // daysActive: earliest batch planting -> latest harvest date.
      const plantingTimes = items
        .map((i) => i.harvest.batch?.plantingDate)
        .filter((d): d is Date => d != null)
        .map((d) => new Date(d).getTime());
      const harvestTimes = items.map((i) => new Date(i.harvest.date).getTime());
      const earliestPlanting =
        plantingTimes.length > 0
          ? Math.min(...plantingTimes)
          : Math.min(...harvestTimes);
      const latestHarvest = Math.max(...harvestTimes);
      const daysActive = Math.max(
        0,
        Math.ceil((latestHarvest - earliestPlanting) / (1000 * 60 * 60 * 24)),
      );

      const criticalAlerts = items.filter(({ totals }) => {
        const picked =
          totals.classA + totals.classB + totals.classC + totals.waste;
        const lowBrix = totals.avgBrix !== null && totals.avgBrix < 6.0;
        const highWaste = picked > 0 && totals.waste / picked > 0.15;
        return lowBrix || highWaste;
      }).length;

      return {
        species: topKey(speciesMap),
        variety: topKey(varietyMap),
        harvestCount: items.length,
        totalYield: this.roundTo(totalYield, 1),
        averageBrix: this.roundTo(averageBrix, 1),
        averageFruitWeight: this.roundTo(averageFruitWeight, 3),
        yieldPerPlant,
        yieldPerMeter,
        marketablePercent: this.roundTo(marketablePercent, 1),
        wastePercent: this.roundTo(wastePercent, 1),
        wasteTotal: this.roundTo(totalWaste, 1),
        classBTotal: this.roundTo(totalClassB, 1),
        classCTotal: this.roundTo(totalClassC, 1),
        criticalAlerts,
        daysActive,
        yieldOverTime: this.generateYieldOverTime(items),
        yieldPerMeterTrend: this.generateYieldPerMeterTrend(items),
        classDistribution: this.generateClassDistribution(items),
        brixTrend: this.generateBrixTrend(items),
        fruitWeightTrend: this.generateFruitWeightTrend(items),
        cumulativeYield: this.generateCumulativeYield(items),
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
      yieldPerMeter: null,
      marketablePercent: 0,
      wastePercent: 0,
      wasteTotal: 0,
      classBTotal: 0,
      classCTotal: 0,
      criticalAlerts: 0,
      daysActive: 0,
      yieldOverTime: [],
      yieldPerMeterTrend: [],
      classDistribution: [],
      brixTrend: [],
      fruitWeightTrend: [],
      cumulativeYield: [],
    };
  }

  private dateKey(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private generateYieldOverTime(
    items: HarvestWithTotals[],
  ): YieldOverTimeData[] {
    const daily = new Map<string, number>();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const sellable = totals.classA + totals.classB + totals.classC;
      daily.set(key, (daily.get(key) ?? 0) + sellable);
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, yield: this.roundTo(value, 1) }));
  }

  private generateYieldPerMeterTrend(
    items: HarvestWithTotals[],
  ): YieldPerMeterData[] {
    const daily = new Map<string, { weight: number; rowLength: number }>();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? { weight: 0, rowLength: 0 };
      cur.weight += totals.totalFruitWeight;
      cur.rowLength += harvest.batch?.rowLength ?? 0;
      daily.set(key, cur);
    }
    return [...daily.entries()]
      .filter(([, v]) => v.rowLength > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        yieldPerMeter: this.roundTo(v.weight / v.rowLength, 3),
      }));
  }

  // Per-day per-class kg, with a dynamic number of classes (index 0=A, 1=B, ...).
  // `classes` is padded to the widest day so every datum has the same length for
  // the stacked chart.
  private generateClassDistribution(
    items: HarvestWithTotals[],
  ): ClassDistributionData[] {
    const daily = new Map<string, { classes: number[]; waste: number }>();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? { classes: [], waste: 0 };
      const kgs = totals.classKgs ?? [];
      for (let i = 0; i < kgs.length; i++) {
        cur.classes[i] = (cur.classes[i] ?? 0) + (kgs[i] ?? 0);
      }
      cur.waste += totals.waste;
      daily.set(key, cur);
    }
    const maxLen = Math.max(
      0,
      ...[...daily.values()].map((d) => d.classes.length),
    );
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        classes: Array.from({ length: maxLen }, (_, i) =>
          this.roundTo(d.classes[i] ?? 0, 1),
        ),
        waste: this.roundTo(d.waste, 1),
      }));
  }

  private generateBrixTrend(items: HarvestWithTotals[]): BrixTrendData[] {
    const daily = new Map<string, { total: number; count: number }>();
    for (const { harvest, totals } of items) {
      if (totals.avgBrix !== null && totals.avgBrix > 0) {
        const key = this.dateKey(harvest.date);
        const cur = daily.get(key) ?? { total: 0, count: 0 };
        cur.total += totals.avgBrix;
        cur.count += 1;
        daily.set(key, cur);
      }
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, brix: this.roundTo(d.total / d.count, 1) }));
  }

  private generateFruitWeightTrend(
    items: HarvestWithTotals[],
  ): FruitWeightTrendData[] {
    const daily = new Map<string, { total: number; count: number }>();
    for (const { harvest, totals } of items) {
      if (totals.avgFruitWeight !== null && totals.avgFruitWeight > 0) {
        const key = this.dateKey(harvest.date);
        const cur = daily.get(key) ?? { total: 0, count: 0 };
        cur.total += totals.avgFruitWeight;
        cur.count += 1;
        daily.set(key, cur);
      }
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        weight: this.roundTo(d.total / d.count, 3),
      }));
  }

  // Cumulative sellable (all classes summed) and waste over time. The chart
  // plots the sellable line, so per-class detail isn't needed here — and summing
  // all classes keeps it correct for any class count.
  private generateCumulativeYield(
    items: HarvestWithTotals[],
  ): CumulativeYieldData[] {
    const daily = new Map<string, { sellable: number; waste: number }>();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? { sellable: 0, waste: 0 };
      cur.sellable += totals.totalFruitWeight;
      cur.waste += totals.waste;
      daily.set(key, cur);
    }
    let sellable = 0;
    let w = 0;
    return [...daily.entries()]
      .sort(([x], [y]) => x.localeCompare(y))
      .map(([date, d]) => {
        sellable += d.sellable;
        w += d.waste;
        return {
          date,
          cumulativeSellable: this.roundTo(sellable, 1),
          cumulativeWaste: this.roundTo(w, 1),
        };
      });
  }
}

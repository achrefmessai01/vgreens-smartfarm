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
  YieldPerRunningMeterData,
  ClassDistributionData,
  BrixTrendData,
  FruitWeightTrendData,
  CumulativeYieldData,
} from './dto/dashboard-metrics.dto';
import { OrderDirection, InputMode } from '@common/enums';
import { roundTo, sum, mean, weightedMean } from '@common/utils';
import { Batch } from '@modules/batch/entities/batch.entity';
import { BatchService } from '@modules/batch/batch.service';
import {
  entryClassWeights,
  entryTotalWeight,
  totalFruitWeight as sumTotalFruitWeight,
} from './utils/harvest-weight.util';

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

  // Mean of a single entry's brix values. Empty -> 0.
  private entryAvgBrix(brixReadings: BrixReading[]): number {
    if (!brixReadings.length) return 0;
    return roundTo(mean(brixReadings.map((b) => b.value)), 1);
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

  // Derive a harvest's totals from its entries (+ parent batch for the yields).
  // All weight derivation flows through the harvest-weight util, so both input
  // modes and any number of quality classes are handled in one place.
  //
  // avgFruitWeight and avgBrix are SAMPLE-WEIGHTED means (by sampleFruitCount),
  // so a larger sample counts proportionally more. fruitCount is the SUM of the
  // per-entry sampleFruitCount — fruits SAMPLED, not an estimate of fruits
  // harvested. totalFruitWeight INCLUDES waste.
  computeTotals(
    entries: HarvestEntry[] | undefined,
    batch?: Batch | null,
  ): HarvestTotals {
    const list = entries ?? [];

    // Per-class sellable kg (waste excluded), summed element-wise across entries.
    // As wide as the widest entry — class count is per-entry, dynamic, unbounded.
    const classWeightsByEntry = list.map((e) => entryClassWeights(e, batch));
    const classN = Math.max(0, ...classWeightsByEntry.map((a) => a.length));
    const classKgs = Array.from({ length: classN }, (_, i) =>
      roundTo(sum(classWeightsByEntry.map((a) => a[i] ?? 0)), 3),
    );
    // Convenience scalars for the first three classes (CSV / summary / compare).
    const classA = classKgs[0] ?? 0;
    const classB = classKgs[1] ?? 0;
    const classC = classKgs[2] ?? 0;

    const waste = roundTo(sum(list.map((e) => e.waste ?? 0)), 3);
    // Total harvested weight = sellable across all classes + waste. Waste counts
    // toward the weight and is still reported separately above.
    const totalFruitWeight = roundTo(sumTotalFruitWeight(list, batch), 3);

    // Total fruits SAMPLED across the entries — not an estimate of fruits
    // harvested.
    const fruitCount = sum(list.map((e) => e.sampleFruitCount ?? 0));

    // Crate-count rollups are meaningful only for crate-mode batches. Dynamic
    // length: as wide as the widest entry's crateCounts (index 0=A, 1=B, ...).
    const isCrate = batch?.inputMode === InputMode.CRATE;
    const crateClassN = isCrate
      ? Math.max(0, ...list.map((e) => e.crateCounts?.length ?? 0))
      : 0;
    const crateCounts = isCrate
      ? Array.from({ length: crateClassN }, (_, i) =>
          sum(list.map((e) => e.crateCounts?.[i] ?? 0)),
        )
      : null;

    // Sample-weighted g/fruit: pooled sample mass / pooled sample fruit count
    // (= per-entry g/fruit weighted by each entry's fruit count). Only entries
    // with a complete sample contribute. Null when none do.
    const sampled = list.filter(
      (e) => (e.sampleWeight ?? 0) > 0 && (e.sampleFruitCount ?? 0) > 0,
    );
    const sampledFruit = sum(sampled.map((e) => e.sampleFruitCount ?? 0));
    const avgFruitWeight =
      sampledFruit > 0
        ? roundTo(
            sum(sampled.map((e) => e.sampleWeight ?? 0)) / sampledFruit,
            3,
          )
        : null;

    // Sample-weighted mean brix across entries that carry a reading (avgBrix > 0),
    // weighted by sampleFruitCount. Null when none do.
    const brixEntries = list.filter((e) => (e.avgBrix ?? 0) > 0);
    const avgBrix =
      brixEntries.length > 0
        ? roundTo(
            weightedMean(
              brixEntries.map((e) => e.avgBrix),
              brixEntries.map((e) => e.sampleFruitCount ?? 0),
            ),
            1,
          )
        : null;

    // Yields divide by the LIVING plant count (planted − lost) and the row
    // lengths. Null-safe: never divide by a zero/missing denominator.
    const livingPlants = (batch?.totalPlants ?? 0) - (batch?.lostPlants ?? 0);
    const rowLength = batch?.rowLength ?? 0;
    const runningMeter = batch?.runningMeter ?? 0;
    const yieldPerPlant =
      livingPlants > 0 ? roundTo(totalFruitWeight / livingPlants, 3) : null;
    const yieldPerMeter =
      rowLength > 0 ? roundTo(totalFruitWeight / rowLength, 3) : null;
    const yieldPerRunningMeter =
      runningMeter > 0 ? roundTo(totalFruitWeight / runningMeter, 3) : null;

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
      yieldPerRunningMeter,
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
        (s, e) => s + entryTotalWeight(e, h.batch),
        0,
      );
      weightByBatch.set(
        h.batchId,
        (weightByBatch.get(h.batchId) ?? 0) + weight,
      );
    }

    return batches.map((b) => {
      const weight = weightByBatch.get(b.id) ?? 0;
      const livingPlants = (b.totalPlants ?? 0) - (b.lostPlants ?? 0);
      return {
        id: b.id,
        name: b.name ?? '',
        species: b.crop?.name,
        variety: b.variety?.name,
        greenhouse: b.greenhouse?.name,
        plantingDate: b.plantingDate,
        status: b.status,
        yieldPerPlant:
          livingPlants > 0 ? roundTo(weight / livingPlants, 3) : null,
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

      const totalClassB = items.reduce((s, i) => s + i.totals.classB, 0);
      const totalClassC = items.reduce((s, i) => s + i.totals.classC, 0);
      const totalWaste = items.reduce((s, i) => s + i.totals.waste, 0);
      // totalFruitWeight already includes waste, so it IS the total yield.
      // Sellable is the remainder once waste is removed — and counts ALL quality
      // classes, not just A/B/C.
      const totalYield = items.reduce(
        (s, i) => s + i.totals.totalFruitWeight,
        0,
      );
      const totalSellable = totalYield - totalWaste;

      const marketablePercent =
        totalYield > 0 ? (totalSellable / totalYield) * 100 : 0;
      const wastePercent = totalYield > 0 ? (totalWaste / totalYield) * 100 : 0;

      // Sample-weighted means: each harvest's average counts in proportion to how
      // many fruits it sampled (fruitCount), so a 2-fruit sample no longer sways
      // the metric as much as a 200-fruit one. Entries with no reading excluded.
      const brixItems = items.filter(
        (i) => i.totals.avgBrix !== null && i.totals.avgBrix > 0,
      );
      const averageBrix = weightedMean(
        brixItems.map((i) => i.totals.avgBrix ?? 0),
        brixItems.map((i) => i.totals.fruitCount),
      );

      const fwItems = items.filter(
        (i) => i.totals.avgFruitWeight !== null && i.totals.avgFruitWeight > 0,
      );
      const averageFruitWeight = weightedMean(
        fwItems.map((i) => i.totals.avgFruitWeight ?? 0),
        fwItems.map((i) => i.totals.fruitCount),
      );

      // Weighted yields: Σ totalFruitWeight / Σ (batch denominator), grouped by
      // batch so each batch's plant count / row length is counted once. Plants
      // are LIVING plants (planted − lost).
      const fruitWeightByBatch = new Map<string, number>();
      const plantsByBatch = new Map<string, number>();
      const rowLengthByBatch = new Map<string, number>();
      const runningMeterByBatch = new Map<string, number>();
      for (const { harvest, totals } of items) {
        const batchId = harvest.batchId;
        fruitWeightByBatch.set(
          batchId,
          (fruitWeightByBatch.get(batchId) ?? 0) + totals.totalFruitWeight,
        );
        if (harvest.batch) {
          plantsByBatch.set(
            batchId,
            (harvest.batch.totalPlants ?? 0) - (harvest.batch.lostPlants ?? 0),
          );
          rowLengthByBatch.set(batchId, harvest.batch.rowLength ?? 0);
          runningMeterByBatch.set(batchId, harvest.batch.runningMeter ?? 0);
        }
      }
      let sumWeightPlants = 0;
      let sumPlants = 0;
      let sumWeightMeters = 0;
      let sumRowLength = 0;
      let sumWeightRunningMeters = 0;
      let sumRunningMeter = 0;
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
        const runningMeter = runningMeterByBatch.get(batchId) ?? 0;
        if (runningMeter > 0) {
          sumWeightRunningMeters += weight;
          sumRunningMeter += runningMeter;
        }
      }
      const yieldPerPlant =
        sumPlants > 0 ? roundTo(sumWeightPlants / sumPlants, 3) : null;
      const yieldPerMeter =
        sumRowLength > 0 ? roundTo(sumWeightMeters / sumRowLength, 3) : null;
      const yieldPerRunningMeter =
        sumRunningMeter > 0
          ? roundTo(sumWeightRunningMeters / sumRunningMeter, 3)
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
        // totalFruitWeight is the full picked weight (all classes + waste).
        const picked = totals.totalFruitWeight;
        const lowBrix = totals.avgBrix !== null && totals.avgBrix < 6.0;
        const highWaste = picked > 0 && totals.waste / picked > 0.15;
        return lowBrix || highWaste;
      }).length;

      return {
        species: topKey(speciesMap),
        variety: topKey(varietyMap),
        harvestCount: items.length,
        totalYield: roundTo(totalYield, 1),
        averageBrix: roundTo(averageBrix, 1),
        averageFruitWeight: roundTo(averageFruitWeight, 3),
        yieldPerPlant,
        yieldPerMeter,
        yieldPerRunningMeter,
        marketablePercent: roundTo(marketablePercent, 1),
        wastePercent: roundTo(wastePercent, 1),
        wasteTotal: roundTo(totalWaste, 1),
        classBTotal: roundTo(totalClassB, 1),
        classCTotal: roundTo(totalClassC, 1),
        criticalAlerts,
        daysActive,
        yieldOverTime: this.generateYieldOverTime(items),
        yieldPerMeterTrend: this.generateYieldPerMeterTrend(items),
        yieldPerRunningMeterTrend:
          this.generateYieldPerRunningMeterTrend(items),
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
      yieldPerRunningMeter: null,
      marketablePercent: 0,
      wastePercent: 0,
      wasteTotal: 0,
      classBTotal: 0,
      classCTotal: 0,
      criticalAlerts: 0,
      daysActive: 0,
      yieldOverTime: [],
      yieldPerMeterTrend: [],
      yieldPerRunningMeterTrend: [],
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
      // Sellable across ALL classes (totalFruitWeight includes waste, so remove
      // it) — not just the first three (A/B/C).
      const sellable = totals.totalFruitWeight - totals.waste;
      daily.set(key, (daily.get(key) ?? 0) + sellable);
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, yield: roundTo(value, 1) }));
  }

  // Per-day weighted yield over a per-batch length denominator (row length or
  // running meters). The denominator is counted ONCE per batch per day — a batch
  // harvested twice in a day must not double its length — mirroring how the
  // dashboard scalar aggregate dedups per batch. Days with no positive length
  // are dropped. Returns [{ date, ratio }]; callers map ratio to the right field.
  private generateYieldPerLengthTrend(
    items: HarvestWithTotals[],
    lengthOf: (batch: Batch) => number,
  ): { date: string; ratio: number }[] {
    const daily = new Map<
      string,
      { weight: Map<string, number>; length: Map<string, number> }
    >();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? { weight: new Map(), length: new Map() };
      const batchId = harvest.batchId;
      cur.weight.set(
        batchId,
        (cur.weight.get(batchId) ?? 0) + totals.totalFruitWeight,
      );
      // Length is a batch constant — set (not add) so repeat harvests of the
      // same batch on a day count its length only once.
      if (harvest.batch) cur.length.set(batchId, lengthOf(harvest.batch));
      daily.set(key, cur);
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => {
        let weight = 0;
        let length = 0;
        for (const [batchId, w] of v.weight) {
          const l = v.length.get(batchId) ?? 0;
          if (l > 0) {
            weight += w;
            length += l;
          }
        }
        return { date, ratio: length > 0 ? roundTo(weight / length, 3) : null };
      })
      .filter((p): p is { date: string; ratio: number } => p.ratio !== null);
  }

  private generateYieldPerMeterTrend(
    items: HarvestWithTotals[],
  ): YieldPerMeterData[] {
    return this.generateYieldPerLengthTrend(items, (b) => b.rowLength ?? 0).map(
      ({ date, ratio }) => ({ date, yieldPerMeter: ratio }),
    );
  }

  private generateYieldPerRunningMeterTrend(
    items: HarvestWithTotals[],
  ): YieldPerRunningMeterData[] {
    return this.generateYieldPerLengthTrend(
      items,
      (b) => b.runningMeter ?? 0,
    ).map(({ date, ratio }) => ({ date, yieldPerRunningMeter: ratio }));
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
          roundTo(d.classes[i] ?? 0, 1),
        ),
        waste: roundTo(d.waste, 1),
      }));
  }

  // Per-day SAMPLE-WEIGHTED mean of a per-harvest average (brix, fruit weight),
  // weighted by each harvest's fruitCount. Harvests whose value is null/≤0 are
  // skipped; when a day's weights are all 0, weightedMean falls back to the plain
  // mean so a reading taken without a fruit count still counts.
  private weightedDailyMean(
    items: HarvestWithTotals[],
    valueOf: (t: HarvestTotals) => number | null,
    decimals: number,
  ): { date: string; value: number }[] {
    const daily = new Map<string, { values: number[]; weights: number[] }>();
    for (const { harvest, totals } of items) {
      const value = valueOf(totals);
      if (value === null || value <= 0) continue;
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? { values: [], weights: [] };
      cur.values.push(value);
      cur.weights.push(totals.fruitCount);
      daily.set(key, cur);
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        value: roundTo(weightedMean(d.values, d.weights), decimals),
      }));
  }

  private generateBrixTrend(items: HarvestWithTotals[]): BrixTrendData[] {
    return this.weightedDailyMean(items, (t) => t.avgBrix, 1).map(
      ({ date, value }) => ({ date, brix: value }),
    );
  }

  private generateFruitWeightTrend(
    items: HarvestWithTotals[],
  ): FruitWeightTrendData[] {
    return this.weightedDailyMean(items, (t) => t.avgFruitWeight, 3).map(
      ({ date, value }) => ({ date, weight: value }),
    );
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
      // totalFruitWeight includes waste; remove it for the sellable line.
      cur.sellable += totals.totalFruitWeight - totals.waste;
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
          cumulativeSellable: roundTo(sellable, 1),
          cumulativeWaste: roundTo(w, 1),
        };
      });
  }
}

import {
  Logger,
  Injectable,
  NotFoundException,
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

  // Non-blocking sanity check for crate-mode input: a per-class remainder at or
  // above a full crate weight means another crate should probably have been
  // counted. Logged, never rejected.
  private warnCrateRemainder(input: HarvestEntryInput, batch: Batch): void {
    if (batch.inputMode !== InputMode.CRATE) return;
    const crateWeight = batch.crateWeight ?? 0;
    if (crateWeight <= 0) return;
    for (const cls of ['A', 'B', 'C'] as const) {
      const remainder = input[`remainingKg${cls}`] ?? 0;
      if (remainder >= crateWeight) {
        this.logger.warn(
          `Crate entry remainingKg${cls}=${remainder} >= crateWeight=${crateWeight} (batch ${batch.id}); that is another full crate.`,
        );
      }
    }
  }

  // Build a persistable entry from input, filling the two derived per-entry
  // fields (avgFruitWeight, avgBrix) — the service is the source of truth for
  // these, never the client.
  //
  // Crate mode (batch.inputMode === CRATE): store only the per-quality crate
  // counts + remainders; classA/B/C, totalFruitWeight and avgFruitWeight are
  // left at 0 because they are derived at read from the batch's current
  // crateWeight (so a crateWeight edit propagates without rewriting rows).
  private buildEntry(
    input: HarvestEntryInput,
    batch: Batch,
  ): DeepPartial<HarvestEntry> {
    const brixReadings: BrixReading[] = (input.brixReadings ?? []).map((b) => ({
      class: b.class,
      value: b.value,
    }));

    if (batch.inputMode === InputMode.CRATE) {
      return {
        rowX: input.rowX ?? 0,
        rowY: input.rowY ?? 0,
        classA: 0,
        classB: 0,
        classC: 0,
        waste: input.waste ?? 0,
        crateCountA: input.crateCountA ?? 0,
        crateCountB: input.crateCountB ?? 0,
        crateCountC: input.crateCountC ?? 0,
        remainingKgA: input.remainingKgA ?? 0,
        remainingKgB: input.remainingKgB ?? 0,
        remainingKgC: input.remainingKgC ?? 0,
        fruitCount: input.fruitCount ?? 0,
        totalFruitWeight: 0,
        avgFruitWeight: 0,
        brixReadings,
        avgBrix: this.entryAvgBrix(brixReadings),
      };
    }

    const fruitCount = input.fruitCount ?? 0;
    const totalFruitWeight = input.totalFruitWeight ?? 0;
    return {
      rowX: input.rowX ?? 0,
      rowY: input.rowY ?? 0,
      classA: input.classA ?? 0,
      classB: input.classB ?? 0,
      classC: input.classC ?? 0,
      waste: input.waste ?? 0,
      fruitCount,
      totalFruitWeight,
      avgFruitWeight:
        fruitCount > 0 ? this.roundTo(totalFruitWeight / fruitCount, 3) : 0,
      brixReadings,
      avgBrix: this.entryAvgBrix(brixReadings),
    };
  }

  // Effective kg for one quality class. Crate mode derives it from the batch's
  // current crateWeight (count × crateWeight + remainder); weight mode reads the
  // stored class kg. Single source of truth — every total flows through here.
  private entryClass(
    e: HarvestEntry,
    batch: Batch | null | undefined,
    cls: 'A' | 'B' | 'C',
  ): number {
    if (batch?.inputMode === InputMode.CRATE) {
      const count = e[`crateCount${cls}`] ?? 0;
      const remainder = e[`remainingKg${cls}`] ?? 0;
      return count * (batch.crateWeight ?? 0) + remainder;
    }
    return e[`class${cls}`] ?? 0;
  }

  // Effective total sellable weight for an entry: sum of the three classes in
  // crate mode, the stored totalFruitWeight in weight mode.
  private entryTotalWeight(
    e: HarvestEntry,
    batch: Batch | null | undefined,
  ): number {
    if (batch?.inputMode === InputMode.CRATE) {
      return (
        this.entryClass(e, batch, 'A') +
        this.entryClass(e, batch, 'B') +
        this.entryClass(e, batch, 'C')
      );
    }
    return e.totalFruitWeight ?? 0;
  }

  // Effective average fruit weight, derived from the effective total so it also
  // tracks a crateWeight edit in crate mode.
  private entryAvgFruitWeight(
    e: HarvestEntry,
    batch: Batch | null | undefined,
  ): number {
    const count = e.fruitCount ?? 0;
    return count > 0
      ? this.roundTo(this.entryTotalWeight(e, batch) / count, 3)
      : 0;
  }

  // Derive a harvest's totals from its entries (+ parent batch for the yields).
  // This is exactly what the omitted DB view would have produced.
  //
  // NOTE: avgFruitWeight and avgBrix are the UNWEIGHTED mean of the per-entry
  // averages — deliberately NOT SUM(totalFruitWeight)/SUM(fruitCount). If a
  // weighted mean is wanted later, change it here.
  computeTotals(
    entries: HarvestEntry[] | undefined,
    batch?: Batch | null,
  ): HarvestTotals {
    const list = entries ?? [];
    const sum = (pick: (e: HarvestEntry) => number): number =>
      list.reduce((s, e) => s + (pick(e) || 0), 0);

    // Class kg and totals flow through the effective-weight helpers so crate-mode
    // entries reflect the batch's current crateWeight.
    const classA = this.roundTo(
      sum((e) => this.entryClass(e, batch, 'A')),
      3,
    );
    const classB = this.roundTo(
      sum((e) => this.entryClass(e, batch, 'B')),
      3,
    );
    const classC = this.roundTo(
      sum((e) => this.entryClass(e, batch, 'C')),
      3,
    );
    const waste = this.roundTo(
      sum((e) => e.waste),
      3,
    );
    const fruitCount = sum((e) => e.fruitCount);
    const totalFruitWeight = this.roundTo(
      sum((e) => this.entryTotalWeight(e, batch)),
      3,
    );

    // Crate-count rollups are meaningful only for crate-mode batches.
    const isCrate = batch?.inputMode === InputMode.CRATE;
    const crateCountA = isCrate ? sum((e) => e.crateCountA ?? 0) : null;
    const crateCountB = isCrate ? sum((e) => e.crateCountB ?? 0) : null;
    const crateCountC = isCrate ? sum((e) => e.crateCountC ?? 0) : null;

    const hasEntries = list.length > 0;
    const avgFruitWeight = hasEntries
      ? this.roundTo(
          this.mean(list.map((e) => this.entryAvgFruitWeight(e, batch))),
          3,
        )
      : null;
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
      classA,
      classB,
      classC,
      waste,
      fruitCount,
      totalFruitWeight,
      crateCountA,
      crateCountB,
      crateCountC,
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

      const harvest = this.harvestRepository.create({
        tenantId,
        batchId: input.batchId,
        createdById,
        date: new Date(input.date),
        photoUrls: input.photoUrls ?? [],
        entries: (input.entries ?? []).map((e) => this.buildEntry(e, batch)),
      });

      const saved = await this.harvestRepository.save(harvest);
      return this.findOneById(saved.id, tenantId);
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

      // Resolve the batch we'll build entries against: the new one if the
      // harvest is being reassigned, otherwise the already-loaded parent.
      let batch = harvest.batch ?? null;
      if (input.batchId !== undefined) {
        batch = await this.batchService.findOneById(input.batchId, tenantId);
        harvest.batchId = input.batchId;
      }
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

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
      if (error instanceof NotFoundException) throw error;
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

  private generateClassDistribution(
    items: HarvestWithTotals[],
  ): ClassDistributionData[] {
    const daily = new Map<
      string,
      { classA: number; classB: number; classC: number; waste: number }
    >();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? {
        classA: 0,
        classB: 0,
        classC: 0,
        waste: 0,
      };
      cur.classA += totals.classA;
      cur.classB += totals.classB;
      cur.classC += totals.classC;
      cur.waste += totals.waste;
      daily.set(key, cur);
    }
    return [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        marketable: this.roundTo(d.classA, 1),
        classB: this.roundTo(d.classB, 1),
        classC: this.roundTo(d.classC, 1),
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

  private generateCumulativeYield(
    items: HarvestWithTotals[],
  ): CumulativeYieldData[] {
    const daily = new Map<
      string,
      { classA: number; classB: number; classC: number; waste: number }
    >();
    for (const { harvest, totals } of items) {
      const key = this.dateKey(harvest.date);
      const cur = daily.get(key) ?? {
        classA: 0,
        classB: 0,
        classC: 0,
        waste: 0,
      };
      cur.classA += totals.classA;
      cur.classB += totals.classB;
      cur.classC += totals.classC;
      cur.waste += totals.waste;
      daily.set(key, cur);
    }
    let a = 0;
    let b = 0;
    let c = 0;
    let w = 0;
    return [...daily.entries()]
      .sort(([x], [y]) => x.localeCompare(y))
      .map(([date, d]) => {
        a += d.classA;
        b += d.classB;
        c += d.classC;
        w += d.waste;
        return {
          date,
          cumulativeClassA: this.roundTo(a, 1),
          cumulativeClassB: this.roundTo(b, 1),
          cumulativeClassC: this.roundTo(c, 1),
          cumulativeWaste: this.roundTo(w, 1),
        };
      });
  }
}

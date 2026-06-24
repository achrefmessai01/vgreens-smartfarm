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
import { HarvestDashboardMetrics } from './dto/dashboard-metrics.dto';
import { OrderDirection, InputMode } from '@common/enums';
import { roundTo, mean } from '@common/utils';
import { Batch } from '@modules/batch/entities/batch.entity';
import { BatchService } from '@modules/batch/batch.service';
import { entryTotalWeight } from './utils/harvest-weight.util';
import { computeHarvestTotals } from './utils/harvest-totals.util';
import {
  buildDashboardMetrics,
  emptyDashboardMetrics,
  type HarvestWithTotals,
} from './utils/harvest-metrics.util';

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
  // The computation is a pure function (harvest-totals.util); this thin method is
  // the seam the resolver and the read paths call.
  computeTotals(
    entries: HarvestEntry[] | undefined,
    batch?: Batch | null,
  ): HarvestTotals {
    return computeHarvestTotals(entries, batch);
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
      return {
        id: b.id,
        name: b.name ?? '',
        species: b.crop?.name,
        variety: b.variety?.name,
        greenhouse: b.greenhouse?.name,
        plantingDate: b.plantingDate,
        status: b.status,
        yieldPerPlant:
          b.livingPlants > 0 ? roundTo(weight / b.livingPlants, 3) : null,
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

      return items.length > 0
        ? buildDashboardMetrics(items)
        : emptyDashboardMetrics();
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
}

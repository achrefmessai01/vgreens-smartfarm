import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DataSource } from 'typeorm';
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
import { Crate } from '@modules/crate/entities/crate.entity';
import { CrateService } from '@modules/crate/crate.service';
import { entryTotalWeight } from './utils/harvest-weight.util';
import { weightToCrate, crateToWeight } from './utils/harvest-conversion.util';
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
    private readonly crateService: CrateService,
    private readonly dataSource: DataSource,
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
      .leftJoinAndSelect(`${alias}.crate`, 'crate')
      .leftJoinAndSelect(`${alias}.entries`, 'entries')
      .leftJoinAndSelect(`${alias}.tenant`, 'tenant')
      .leftJoinAndSelect(`${alias}.createdBy`, 'createdBy');
  }

  /**
   * Crate weight a harvest derives its crate-mode kg from: its selected crate,
   * falling back to the legacy `batch.crateWeight` for crate-mode harvests not
   * yet repointed.
   */
  private harvestCrateWeight(harvest: Harvest): number | null {
    return harvest.crate?.weight ?? harvest.batch?.crateWeight ?? null;
  }

  /**
   * Resolve and validate a harvest's crate against its own input mode.
   * Weight-mode harvests carry none (returns null); crate-mode harvests
   * require a crate that belongs to the caller's tenant.
   */
  private async resolveCrate(
    crateId: string | null | undefined,
    inputMode: InputMode,
    tenantId: string | undefined,
  ): Promise<Crate | null> {
    if (inputMode !== InputMode.CRATE) return null;
    if (!crateId) {
      throw new BadRequestException(
        'A crate must be selected for crate-mode harvests',
      );
    }
    const crate = await this.crateService.findOneScoped(crateId, tenantId);
    if (!crate) {
      throw new NotFoundException(`Crate with ID ${crateId} not found`);
    }
    return crate;
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
  private warnCrateRemainder(
    input: HarvestEntryInput,
    inputMode: InputMode,
    crateWeight: number | null,
    batchId: string,
  ): void {
    if (inputMode !== InputMode.CRATE) return;
    const weight = crateWeight ?? 0;
    if (weight <= 0) return;
    (input.remainingKgs ?? []).forEach((remainder, i) => {
      if ((remainder ?? 0) >= weight) {
        this.logger.warn(
          `Crate entry remainingKg[${this.classLetter(i)}]=${remainder} >= crateWeight=${weight} (batch ${batchId}); that is another full crate.`,
        );
      }
    });
  }

  // Structural integrity check for an entry's row segments. rowX[i] pairs with
  // rowY[i] to span segment i, so the two arrays MUST be equal length and each
  // segment must run start -> end (rowX[i] <= rowY[i]). Mirrors the batch
  // service's validateRowRange. Segment ordering / non-overlap across segments
  // is intentionally NOT enforced here — that is a soft, warn-but-allow check on
  // the client, consistent with how out-of-range row values are treated.
  private validateRowSegments(input: HarvestEntryInput): void {
    const rowX = input.rowX ?? [];
    const rowY = input.rowY ?? [];
    if (rowX.length !== rowY.length) {
      throw new BadRequestException(
        `rowX and rowY must have the same length (got ${rowX.length} and ${rowY.length})`,
      );
    }
    for (let i = 0; i < rowX.length; i++) {
      if (rowX[i] > rowY[i]) {
        throw new BadRequestException(
          `Row segment ${i + 1}: start (${rowX[i]}) must be less than or equal to end (${rowY[i]})`,
        );
      }
    }
  }

  // Build a persistable entry from input, filling the two derived per-entry
  // fields (avgFruitWeight, avgBrix) — the service is the source of truth for
  // these, never the client.
  //
  // Both modes store per-quality arrays now: weight mode the kg directly
  // (classKgs), crate mode the counts + remainders (kg derived at read from the
  // harvest's crate weight, so a crate change propagates). The derived fields
  // (totalFruitWeight, avgFruitWeight) are always computed at read via the
  // helpers below and left 0 in storage. The mode is the HARVEST's own, not the
  // batch's.
  private buildEntry(
    input: HarvestEntryInput,
    inputMode: InputMode,
    position: number,
  ): DeepPartial<HarvestEntry> {
    const brixReadings: BrixReading[] = (input.brixReadings ?? []).map((b) => ({
      class: b.class,
      value: b.value,
    }));

    const common = {
      position,
      rowX: input.rowX ?? [],
      rowY: input.rowY ?? [],
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

    // The inactive mode's arrays are explicitly nulled so an in-place entry
    // update can never leave stale other-mode data behind.
    if (inputMode === InputMode.CRATE) {
      return {
        ...common,
        crateCounts: input.crateCounts ?? [],
        remainingKgs: input.remainingKgs ?? [],
        classKgs: null,
      };
    }
    return {
      ...common,
      classKgs: input.classKgs ?? [],
      crateCounts: null,
      remainingKgs: null,
    };
  }

  // Derive a harvest's totals from its entries (+ the harvest's own inputMode
  // for weight derivation + parent batch for the yields). The computation is a
  // pure function (harvest-totals.util); this thin method is the seam the
  // resolver and the read paths call.
  computeTotals(
    entries: HarvestEntry[] | undefined,
    inputMode?: InputMode | null,
    batch?: Batch | null,
    crateWeight?: number | null,
  ): HarvestTotals {
    return computeHarvestTotals(entries, inputMode, batch, crateWeight);
  }

  async findAllFiltered(
    tenantId: string | undefined,
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    try {
      const qb = this.withRelations()
        .orderBy('harvest.date', OrderDirection.DESC)
        .addOrderBy('harvest.createdAt', OrderDirection.DESC)
        .addOrderBy('entries.position', OrderDirection.ASC);

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
      h.totals = this.computeTotals(
        h.entries,
        h.inputMode,
        h.batch,
        this.harvestCrateWeight(h),
      );
    }
    return harvests;
  }

  async findOneWithRelations(
    id: string,
    tenantId?: string,
  ): Promise<Harvest | null> {
    const qb = this.withRelations()
      .where('harvest.id = :id', { id })
      .orderBy('entries.position', OrderDirection.ASC);
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
      // Validates the batch exists and belongs to the tenant. The input mode is
      // the HARVEST's own choice now (defaulting to weight), not the batch's.
      await this.batchService.findOneById(input.batchId, tenantId);
      const inputMode = input.inputMode ?? InputMode.WEIGHT;
      const crate = await this.resolveCrate(input.crateId, inputMode, tenantId);
      (input.entries ?? []).forEach((e) => {
        this.validateRowSegments(e);
        this.warnCrateRemainder(
          e,
          inputMode,
          crate?.weight ?? null,
          input.batchId,
        );
      });

      this.validateTiming(input.startTime, input.stopTime);

      const harvest = this.harvestRepository.create({
        tenantId,
        batchId: input.batchId,
        inputMode,
        crateId: crate?.id ?? null,
        createdById,
        date: new Date(input.date),
        startTime: input.startTime ?? null,
        stopTime: input.stopTime ?? null,
        harvesterHeadCount: input.harvesterHeadCount ?? null,
        photoUrls: input.photoUrls ?? [],
      });

      const saved = await this.harvestRepository.save(harvest);
      // Insert entries one at a time rather than as one batched insert: a
      // multi-row insert stamps every row with the identical createdAt, while
      // sequential saves give each entry its own timestamp in form order.
      try {
        for (const [i, e] of (input.entries ?? []).entries()) {
          await this.entryRepository.save(
            this.entryRepository.create({
              ...this.buildEntry(e, inputMode, i),
              harvestId: saved.id,
            }),
          );
        }
      } catch (error) {
        // Don't leave a half-created harvest behind (cascade removes any
        // entries that did make it in).
        await this.harvestRepository.delete(saved.id);
        throw error;
      }
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

      // Reassigning the harvest to another batch only needs the target
      // validated — the input mode is the harvest's own and moves with it.
      if (input.batchId !== undefined) {
        await this.batchService.findOneById(input.batchId, tenantId);
        harvest.batchId = input.batchId;
      }
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

      // Re-resolve the crate against the merged state: an explicit crateId
      // reassigns it, otherwise the stored crate is kept. Validation keys off
      // the harvest's own (immutable-on-update) input mode; mode changes go
      // through convertHarvestInputMode.
      const nextCrateId =
        input.crateId !== undefined ? input.crateId : harvest.crateId;
      const crate = await this.resolveCrate(
        nextCrateId,
        harvest.inputMode,
        tenantId,
      );
      harvest.crateId = crate?.id ?? null;
      // Keep the loaded relation in sync: TypeORM derives the FK from the
      // relation object on save, which would otherwise override crateId with
      // the stale value and silently drop the reassignment.
      harvest.crate = crate;
      const crateWeight: number | null = crate?.weight ?? null;

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

      // Entries are authoritative when supplied, but the stored rows are
      // reconciled IN PLACE by position rather than deleted and reinserted:
      // input entry i overwrites the stored entry at position i (keeping its
      // id and original createdAt), entries beyond the stored count are
      // appended one at a time (each with its own createdAt), and surplus
      // stored rows are removed. All are rebuilt in the harvest's own input
      // mode.
      if (input.entries !== undefined) {
        input.entries.forEach((e) => {
          this.validateRowSegments(e);
          this.warnCrateRemainder(
            e,
            harvest.inputMode,
            crateWeight,
            harvest.batchId,
          );
        });
        const existing = await this.entryRepository.find({
          where: { harvestId: id },
          order: { position: 'ASC', createdAt: 'ASC', id: 'ASC' },
        });
        for (const [i, e] of input.entries.entries()) {
          const built = this.buildEntry(e, harvest.inputMode, i);
          if (i < existing.length) {
            await this.entryRepository.update(existing[i].id, built);
          } else {
            await this.entryRepository.save(
              this.entryRepository.create({ ...built, harvestId: id }),
            );
          }
        }
        const surplus = existing.slice(input.entries.length);
        if (surplus.length > 0) {
          await this.entryRepository.delete(surplus.map((e) => e.id));
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

  // Flip ONE harvest between weight and crate mode, converting each of its
  // entries in place (index = quality-class identity, preserved). inputMode is
  // a per-harvest field, so the scope is a single harvest — sibling harvests in
  // the same batch are untouched and a batch can end up holding both modes.
  // The harvest's flag, its crate, and every entry's arrays are rewritten
  // together in a single transaction — all or nothing.
  //
  // The crate weight the entries convert against:
  //  - to CRATE: the crate supplied in `crateId` (required; the harvest is
  //    pointed at it);
  //  - to WEIGHT: the harvest's own current crate weight (kept, so a switch
  //    back reuses it).
  async convertHarvestInputMode(
    harvestId: string,
    targetMode: InputMode,
    crateId: string | null | undefined,
    tenantId?: string,
  ): Promise<Harvest> {
    try {
      const harvest = await this.findOneById(harvestId, tenantId);

      // Already in the requested mode: nothing to convert.
      if (harvest.inputMode === targetMode) return harvest;

      // Resolve the crate weight the entries convert against before any write,
      // so the conversion validates up front and fails cleanly.
      let crate: Crate | null = null;
      let crateWeight: number;
      if (targetMode === InputMode.CRATE) {
        // Crate mode derives kg from a crate weight, so a crate is required and
        // must have a positive weight (we never divide by zero).
        if (!crateId) {
          throw new BadRequestException(
            'A crate must be selected to switch this harvest to crate mode',
          );
        }
        crate = await this.crateService.findOneScoped(crateId, tenantId);
        if (!crate) {
          throw new NotFoundException(`Crate with ID ${crateId} not found`);
        }
        if (!(crate.weight > 0)) {
          throw new BadRequestException(
            'The selected crate must have a weight greater than 0',
          );
        }
        crateWeight = crate.weight;
      } else {
        // Switching to weight mode reconstructs kg from the harvest's own crate
        // weight; it must have a positive one.
        const cw = this.harvestCrateWeight(harvest);
        if (!(cw != null && cw > 0)) {
          throw new BadRequestException(
            `Harvest ${harvestId} has no crate weight to convert from; set a crate first`,
          );
        }
        crateWeight = cw;
      }

      await this.dataSource.transaction(async (manager) => {
        // Flip the harvest's flag (and point it at the chosen crate when
        // entering crate mode; leaving keeps the crate so a switch back reuses
        // it). Scalar-only update to avoid cascading the loaded graph.
        await manager.update(
          Harvest,
          harvestId,
          crate
            ? { inputMode: targetMode, crateId: crate.id }
            : { inputMode: targetMode },
        );

        for (const entry of harvest.entries ?? []) {
          if (targetMode === InputMode.CRATE) {
            const { crateCounts, remainingKgs } = weightToCrate(
              entry.classKgs ?? [],
              crateWeight,
            );
            // Store the mode's arrays; null the other mode's so an entry only
            // ever carries its active mode's data (mirrors buildEntry).
            await manager.update(HarvestEntry, entry.id, {
              crateCounts,
              remainingKgs,
              classKgs: null,
            });
          } else {
            const { classKgs } = crateToWeight(
              entry.crateCounts ?? [],
              entry.remainingKgs ?? [],
              crateWeight,
            );
            await manager.update(HarvestEntry, entry.id, {
              classKgs,
              crateCounts: null,
              remainingKgs: null,
            });
          }
        }
      });

      return this.findOneById(harvestId, tenantId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `convertHarvestInputMode failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to convert harvest input mode',
      );
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
      // entryTotalWeight reads crate-mode entries off the harvest's own mode +
      // crate weight; findAllFiltered already joins h.crate/h.batch.
      const crateWeight = this.harvestCrateWeight(h);
      const weight = (h.entries ?? []).reduce(
        (s, e) => s + entryTotalWeight(e, h.inputMode, crateWeight),
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
      const qb = this.withRelations()
        .orderBy('harvest.date', OrderDirection.ASC)
        .addOrderBy('entries.position', OrderDirection.ASC);

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
        totals: this.computeTotals(
          harvest.entries,
          harvest.inputMode,
          harvest.batch,
          this.harvestCrateWeight(harvest),
        ),
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

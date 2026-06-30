import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '@common/services';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Variety } from '@modules/variety/entities/variety.entity';
import { GreenhouseCrop } from '@modules/greenhouse-crop/entities/greenhouse-crop.entity';
import { Harvest } from '@modules/harvest/entities/harvest.entity';
import { Batch } from './entities/batch.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { BatchFilterInput } from './dto/batch-filter.input';
import { BatchSortInput } from './dto/batch-sort.input';
import { buildBatchOrderBy } from './utils/batch-order.util';
import { buildBatchNumber } from '@modules/harvest/utils/batch-number.util';
import { InputMode } from '@common/enums';

@Injectable()
export class BatchService extends BaseService<Batch> {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    @InjectRepository(Variety)
    private readonly varietyRepository: Repository<Variety>,
    @InjectRepository(GreenhouseCrop)
    private readonly greenhouseCropRepository: Repository<GreenhouseCrop>,
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
  ) {
    super(batchRepository);
  }

  // rowSpacing = cultivationArea / (numberOfRows * rowLength); 0 when the
  // denominator is non-positive. Ported from the old HarvestsService.
  private computeRowSpacing(
    cultivationArea: number,
    numberOfRows: number,
    rowLength: number,
  ): number {
    const denominator = numberOfRows * rowLength;
    if (denominator <= 0) return 0;
    return cultivationArea / denominator;
  }

  /**
   * Resolve a batch's crate config. Crate weight now lives per-harvest on the
   * selected crate, so crate-mode batches no longer require a `crateWeight` —
   * only the input mode is fixed here. The deprecated column is still accepted
   * for backward compatibility but defaults to null; weight mode never carries
   * one.
   */
  private resolveCrateConfig(
    inputMode: InputMode,
    crateWeight: number | null | undefined,
  ): { inputMode: InputMode; crateWeight: number | null } {
    if (inputMode === InputMode.CRATE) {
      return { inputMode, crateWeight: crateWeight ?? null };
    }
    return { inputMode: InputMode.WEIGHT, crateWeight: null };
  }

  // Backend-filled defaults that the user can override by passing explicit values.
  private deriveCultivationArea(input: {
    cultivationArea?: number;
    numberOfRows?: number;
    rowLength?: number;
    rowSpacing?: number;
  }): number {
    if (input.cultivationArea != null) return input.cultivationArea;
    const rows = input.numberOfRows ?? 0;
    const length = input.rowLength ?? 0;
    const spacing = input.rowSpacing ?? 0;
    return rows * length * spacing;
  }

  private deriveTotalPlants(input: {
    totalPlants?: number;
    numberOfRows?: number;
    rowLength?: number;
    plantsPerMeter?: number;
  }): number {
    if (input.totalPlants != null) return input.totalPlants;
    const rows = input.numberOfRows ?? 0;
    const length = input.rowLength ?? 0;
    const perMeter = input.plantsPerMeter ?? 0;
    return Math.round(rows * length * perMeter);
  }

  // Validate the greenhouse -> crop -> variety chain and resolve the live crop
  // (and variety) rows. Enforces:
  //  - the crop is assigned to the greenhouse via greenhouse_crops, and
  //  - the variety (if given) belongs to that crop and is not soft-deleted.
  // Returns the catalog rows so callers can derive name/batchNumber.
  private async validateCropSelection(
    greenhouseId: string | null | undefined,
    cropId: string,
    varietyId: string | null | undefined,
  ): Promise<{ crop: Crop; variety: Variety | null }> {
    if (!greenhouseId) {
      throw new BadRequestException(
        'greenhouseId is required to select a crop',
      );
    }

    const crop = await this.cropRepository.findOne({ where: { id: cropId } });
    if (!crop) {
      throw new BadRequestException(`Crop with ID ${cropId} not found`);
    }

    const assignment = await this.greenhouseCropRepository.findOne({
      where: { greenhouseId, cropId },
    });
    if (!assignment) {
      throw new BadRequestException(
        `Crop ${cropId} is not assigned to greenhouse ${greenhouseId}`,
      );
    }

    let variety: Variety | null = null;
    if (varietyId) {
      variety = await this.varietyRepository.findOne({
        where: { id: varietyId, deletedAt: IsNull() },
      });
      if (!variety || variety.cropId !== cropId) {
        throw new BadRequestException(
          `Variety ${varietyId} does not belong to crop ${cropId}`,
        );
      }
    }

    return { crop, variety };
  }

  // The row range is a contiguous block, so a defined start must not come after
  // the end. Either bound may be null (legacy batches are backfilled by hand);
  // the check only applies when both are present. @Min(0) on the DTO already
  // rejects negatives, so this only guards the start <= end ordering.
  private validateRowRange(
    startRow: number | null | undefined,
    endRow: number | null | undefined,
  ): void {
    if (startRow != null && endRow != null && startRow > endRow) {
      throw new BadRequestException(
        `startRow (${startRow}) must be less than or equal to endRow (${endRow})`,
      );
    }
  }

  async findAllScoped(
    tenantId: string | undefined,
    filter?: BatchFilterInput | null,
    sort?: BatchSortInput | null,
  ): Promise<Batch[]> {
    const qb = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.tenant', 'tenant')
      .leftJoinAndSelect('batch.greenhouse', 'greenhouse')
      .leftJoinAndSelect('batch.crop', 'crop')
      .leftJoinAndSelect('batch.variety', 'variety')
      .leftJoinAndSelect('batch.createdBy', 'createdBy');

    if (tenantId !== undefined) {
      qb.andWhere('batch.tenantId = :tenantId', { tenantId });
    }

    // Inclusive plantingDate range. plantingDate is a `date` column, so a
    // `<= :to` comparison includes the whole `to` day.
    if (filter?.plantingDateFrom) {
      qb.andWhere('batch.plantingDate >= :plantingDateFrom', {
        plantingDateFrom: filter.plantingDateFrom,
      });
    }
    if (filter?.plantingDateTo) {
      qb.andWhere('batch.plantingDate <= :plantingDateTo', {
        plantingDateTo: filter.plantingDateTo,
      });
    }

    // Apply the (validated) sort selection. The first clause becomes the
    // primary ORDER BY; the rest are deterministic tiebreakers.
    buildBatchOrderBy(sort).forEach((clause, index) => {
      if (index === 0) {
        qb.orderBy(clause.expression, clause.direction, clause.nulls);
      } else {
        qb.addOrderBy(clause.expression, clause.direction, clause.nulls);
      }
    });

    return qb.getMany();
  }

  async findOneById(id: string, tenantId?: string): Promise<Batch> {
    const qb = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.tenant', 'tenant')
      .leftJoinAndSelect('batch.greenhouse', 'greenhouse')
      .leftJoinAndSelect('batch.crop', 'crop')
      .leftJoinAndSelect('batch.variety', 'variety')
      .leftJoinAndSelect('batch.createdBy', 'createdBy')
      .where('batch.id = :id', { id });
    if (tenantId !== undefined) {
      qb.andWhere('batch.tenantId = :tenantId', { tenantId });
    }
    const batch = await qb.getOne();
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async createBatch(
    input: CreateBatchInput,
    tenantId: string,
    createdById: string,
  ): Promise<Batch> {
    // Validate the crop/variety selection up front; a BadRequestException here
    // should surface to the client rather than become a 500.
    const { crop, variety } = await this.validateCropSelection(
      input.greenhouseId,
      input.cropId,
      input.varietyId,
    );
    this.validateRowRange(input.startRow, input.endRow);
    const { inputMode, crateWeight } = this.resolveCrateConfig(
      input.inputMode ?? InputMode.WEIGHT,
      input.crateWeight,
    );

    try {
      const numberOfRows = input.numberOfRows ?? 0;
      const rowLength = input.rowLength ?? 0;
      const rowSpacing =
        input.rowSpacing ??
        this.computeRowSpacing(
          input.cultivationArea ?? 0,
          numberOfRows,
          rowLength,
        );
      const derivedName =
        [crop.name, variety?.name].filter(Boolean).join(' - ') || undefined;
      const name = input.name ?? derivedName;

      const batch = this.batchRepository.create({
        tenantId,
        greenhouseId: input.greenhouseId ?? null,
        createdById,
        cropId: input.cropId,
        varietyId: input.varietyId ?? null,
        name,
        batchNumber: buildBatchNumber(
          variety?.name ?? crop.name,
          input.plantingDate,
        ),
        status: input.status,
        plantingDate: new Date(input.plantingDate),
        numberOfRows,
        rowLength,
        rowSpacing,
        plantsPerMeter: input.plantsPerMeter ?? 0,
        startRow: input.startRow ?? null,
        endRow: input.endRow ?? null,
        lostPlants: input.lostPlants ?? 0,
        cultivationArea: this.deriveCultivationArea({ ...input, rowSpacing }),
        totalPlants: this.deriveTotalPlants(input),
        replicates: input.replicates ?? 1,
        avgHeadsPerPlant: input.avgHeadsPerPlant ?? null,
        slabLength: input.slabLength ?? null,
        headsPerSlab: input.headsPerSlab ?? null,
        inputMode,
        crateWeight,
      });

      const saved = await this.batchRepository.save(batch);
      return this.findOneById(saved.id, tenantId);
    } catch (error) {
      this.logger.error(
        `createBatch failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create batch');
    }
  }

  async updateBatch(
    id: string,
    input: UpdateBatchInput,
    tenantId?: string,
  ): Promise<Batch> {
    const batch = await this.findOneById(id, tenantId);

    if (input.greenhouseId !== undefined)
      batch.greenhouseId = input.greenhouseId;

    // Re-validate the greenhouse -> crop -> variety chain whenever any link in
    // it changes, against the resulting combination. When the chain changes we
    // also stage a re-derived display name so the batch header / list / details
    // reflect the new variety; explicit `input.name` below still wins.
    let derivedName: string | null = null;
    if (
      input.greenhouseId !== undefined ||
      input.cropId !== undefined ||
      input.varietyId !== undefined
    ) {
      const cropId = input.cropId ?? batch.cropId;
      const varietyId =
        input.varietyId !== undefined ? input.varietyId : batch.varietyId;
      const { crop, variety } = await this.validateCropSelection(
        batch.greenhouseId,
        cropId,
        varietyId,
      );
      batch.cropId = cropId;
      batch.varietyId = varietyId ?? null;
      // Keep the eagerly-loaded relations in sync with the new FKs. Without
      // this, TypeORM's save() can resolve the FK from the still-attached
      // `variety` / `crop` relation objects loaded by findOneById and silently
      // revert the column change — which is what was happening here: only the
      // FK column was set, so the stale relation object won and the variety
      // never actually updated in the DB.
      batch.crop = crop;
      batch.variety = variety;
      derivedName =
        [crop.name, variety?.name].filter(Boolean).join(' - ') || null;
    }

    if (input.name !== undefined) {
      batch.name = input.name;
    } else if (derivedName !== null) {
      // No explicit name provided — keep the stored name in sync with the
      // current crop/variety pair (mirrors createBatch's derivation).
      batch.name = derivedName;
    }
    if (input.status !== undefined) batch.status = input.status;
    if (input.plantingDate !== undefined)
      batch.plantingDate = new Date(input.plantingDate);
    if (input.numberOfRows !== undefined)
      batch.numberOfRows = input.numberOfRows;
    if (input.rowLength !== undefined) batch.rowLength = input.rowLength;
    if (input.plantsPerMeter !== undefined)
      batch.plantsPerMeter = input.plantsPerMeter;
    if (input.lostPlants !== undefined) batch.lostPlants = input.lostPlants;

    // Recompute rowSpacing when a driving field changed and no explicit value
    // was supplied.
    if (input.rowSpacing !== undefined) {
      batch.rowSpacing = input.rowSpacing;
    } else if (
      input.cultivationArea !== undefined ||
      input.numberOfRows !== undefined ||
      input.rowLength !== undefined
    ) {
      batch.rowSpacing = this.computeRowSpacing(
        input.cultivationArea ?? batch.cultivationArea,
        batch.numberOfRows,
        batch.rowLength,
      );
    }
    if (input.cultivationArea !== undefined)
      batch.cultivationArea = input.cultivationArea;
    if (input.totalPlants !== undefined) batch.totalPlants = input.totalPlants;
    if (input.replicates !== undefined) batch.replicates = input.replicates;
    if (input.avgHeadsPerPlant !== undefined)
      batch.avgHeadsPerPlant = input.avgHeadsPerPlant;
    if (input.slabLength !== undefined) batch.slabLength = input.slabLength;
    if (input.headsPerSlab !== undefined)
      batch.headsPerSlab = input.headsPerSlab;

    // inputMode is fixed at creation, so it is intentionally not applied here.
    // crateWeight stays editable: a new value re-validates against the batch's
    // existing mode and propagates to every crate-mode entry's derived yield.
    if (input.crateWeight !== undefined) {
      if (batch.inputMode === InputMode.CRATE) {
        const { crateWeight } = this.resolveCrateConfig(
          InputMode.CRATE,
          input.crateWeight,
        );
        batch.crateWeight = crateWeight;
      } else {
        throw new BadRequestException(
          'crateWeight can only be set on a crate-mode batch',
        );
      }
    }

    // Apply row-range changes, then validate the resulting (start, end) pair so
    // a partial update can't leave start > end.
    if (input.startRow !== undefined) batch.startRow = input.startRow;
    if (input.endRow !== undefined) batch.endRow = input.endRow;
    this.validateRowRange(batch.startRow, batch.endRow);

    await this.batchRepository.save(batch);
    return this.findOneById(id, tenantId);
  }

  // Soft-delete a batch and cascade the soft-delete to its harvests, so a
  // deleted batch takes its linked harvest events with it (no dangling rows
  // that would resurface if the batch were ever restored). Both the batch and
  // harvest list queries already exclude soft-deleted rows automatically.
  async deleteBatch(
    id: string,
    deletedById: string,
    tenantId?: string,
  ): Promise<void> {
    const batch = await this.findOneById(id, tenantId);

    // Stamp who deleted them, then soft-delete the harvests followed by the
    // batch. softDelete only touches rows whose deletedAt IS NULL, so this is
    // idempotent for harvests that were already removed individually.
    await this.harvestRepository.update({ batchId: id }, { deletedById });
    await this.harvestRepository.softDelete({ batchId: id });

    batch.deletedById = deletedById;
    await this.batchRepository.save(batch);
    await this.batchRepository.softDelete(id);
  }
}

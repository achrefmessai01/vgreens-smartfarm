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
import { OrderDirection } from '@common/enums';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Variety } from '@modules/variety/entities/variety.entity';
import { GreenhouseCrop } from '@modules/greenhouse-crop/entities/greenhouse-crop.entity';
import { Batch } from './entities/batch.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { buildBatchNumber } from '@modules/harvest/utils/batch-number.util';

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

  async findAllScoped(tenantId: string | undefined): Promise<Batch[]> {
    const qb = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.tenant', 'tenant')
      .leftJoinAndSelect('batch.greenhouse', 'greenhouse')
      .leftJoinAndSelect('batch.crop', 'crop')
      .leftJoinAndSelect('batch.variety', 'variety')
      .leftJoinAndSelect('batch.createdBy', 'createdBy')
      .orderBy('batch.plantingDate', OrderDirection.DESC)
      .addOrderBy('batch.createdAt', OrderDirection.DESC);

    if (tenantId !== undefined) {
      qb.andWhere('batch.tenantId = :tenantId', { tenantId });
    }
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
        lostPlants: input.lostPlants ?? 0,
        cultivationArea: this.deriveCultivationArea({ ...input, rowSpacing }),
        totalPlants: this.deriveTotalPlants(input),
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
    // it changes, against the resulting combination.
    if (
      input.greenhouseId !== undefined ||
      input.cropId !== undefined ||
      input.varietyId !== undefined
    ) {
      const cropId = input.cropId ?? batch.cropId;
      const varietyId =
        input.varietyId !== undefined ? input.varietyId : batch.varietyId;
      await this.validateCropSelection(batch.greenhouseId, cropId, varietyId);
      batch.cropId = cropId;
      batch.varietyId = varietyId ?? null;
    }

    if (input.name !== undefined) batch.name = input.name;
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

    await this.batchRepository.save(batch);
    return this.findOneById(id, tenantId);
  }

  async deleteBatch(
    id: string,
    deletedById: string,
    tenantId?: string,
  ): Promise<void> {
    const batch = await this.findOneById(id, tenantId);
    batch.deletedById = deletedById;
    await this.batchRepository.save(batch);
    await this.batchRepository.softDelete(id);
  }
}

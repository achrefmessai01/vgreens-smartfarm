import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@common/services';
import { OrderDirection } from '@common/enums';
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
  ) {
    super(batchRepository);
  }

  private readonly batchRelations = ['tenant', 'greenhouse', 'createdBy'];

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

  async findAllScoped(tenantId: string | undefined): Promise<Batch[]> {
    const qb = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.tenant', 'tenant')
      .leftJoinAndSelect('batch.greenhouse', 'greenhouse')
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
        [input.species, input.variety].filter(Boolean).join(' - ') || undefined;
      const name = input.name ?? derivedName;

      const batch = this.batchRepository.create({
        tenantId,
        greenhouseId: input.greenhouseId ?? null,
        createdById,
        species: input.species,
        variety: input.variety,
        name,
        batchNumber: input.variety
          ? buildBatchNumber(input.variety, input.plantingDate)
          : undefined,
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
    if (input.species !== undefined) batch.species = input.species;
    if (input.variety !== undefined) batch.variety = input.variety;
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

    return this.batchRepository.save(batch);
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

import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseService } from '@common/services';
import { Harvest } from './entities/harvest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHarvestInput } from './dto/create-harvest.input';
import { UpdateHarvestInput } from './dto/update-harvest.input';
import { HarvestFilterInput } from './dto/harvest-filter.input';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';
import { OrderDirection } from '@/common/enums/order-direction.enum';

@Injectable()
export class HarvestsService extends BaseService<Harvest> {
  private readonly logger = new Logger(HarvestsService.name);

  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
  ) {
    super(harvestRepository);
  }

  private readonly harvestRelations = ['tenant', 'createdBy'] as const;

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

      const harvest = this.harvestRepository.create({
        tenantId,
        createdById,
        species: input.species,
        variety: input.variety,
        batch: batchName,
        greenhouse: input.greenhouse ?? undefined,
        plantingDate: new Date(input.plantingDate),
        cultivationArea: input.cultivationArea,
        status: input.status ?? HarvestStatus.ACTIVE,
        date: new Date(input.date),
        classA: input.classA ?? 0,
        waste: input.waste ?? 0,
        avgBrix: input.avgBrix ?? 0,
        brix1: input.brix1 ?? 0,
        brix2: input.brix2 ?? 0,
        brix3: input.brix3 ?? 0,
        brix4: input.brix4 ?? 0,
        brix5: input.brix5 ?? 0,
        brix6: input.brix6 ?? 0,
        brix7: input.brix7 ?? 0,
        brix8: input.brix8 ?? 0,
        brix9: input.brix9 ?? 0,
        brix10: input.brix10 ?? 0,
        photos: input.photos ?? 0,
        photoUrls: input.photoUrls ?? [],
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
      if (input.greenhouse !== undefined) harvest.greenhouse = input.greenhouse;
      if (input.plantingDate !== undefined) {
        harvest.plantingDate = new Date(input.plantingDate);
      }
      if (input.cultivationArea !== undefined)
        harvest.cultivationArea = input.cultivationArea;
      if (input.status !== undefined) harvest.status = input.status;
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.classA !== undefined) harvest.classA = input.classA;
      if (input.waste !== undefined) harvest.waste = input.waste;
      if (input.avgBrix !== undefined) harvest.avgBrix = input.avgBrix;
      if (input.brix1 !== undefined) harvest.brix1 = input.brix1;
      if (input.brix2 !== undefined) harvest.brix2 = input.brix2;
      if (input.brix3 !== undefined) harvest.brix3 = input.brix3;
      if (input.brix4 !== undefined) harvest.brix4 = input.brix4;
      if (input.brix5 !== undefined) harvest.brix5 = input.brix5;
      if (input.brix6 !== undefined) harvest.brix6 = input.brix6;
      if (input.brix7 !== undefined) harvest.brix7 = input.brix7;
      if (input.brix8 !== undefined) harvest.brix8 = input.brix8;
      if (input.brix9 !== undefined) harvest.brix9 = input.brix9;
      if (input.brix10 !== undefined) harvest.brix10 = input.brix10;
      if (input.photos !== undefined) harvest.photos = input.photos;
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

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
}

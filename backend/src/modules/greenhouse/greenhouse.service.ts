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
import { Greenhouse } from './entities/greenhouse.entity';
import { CreateGreenhouseInput } from './dto/create-greenhouse.input';
import { UpdateGreenhouseInput } from './dto/update-greenhouse.input';

@Injectable()
export class GreenhouseService extends BaseService<Greenhouse> {
  private readonly logger = new Logger(GreenhouseService.name);

  constructor(
    @InjectRepository(Greenhouse)
    private readonly greenhouseRepository: Repository<Greenhouse>,
  ) {
    super(greenhouseRepository);
  }

  async findAllScoped(tenantId: string | undefined): Promise<Greenhouse[]> {
    const qb = this.greenhouseRepository
      .createQueryBuilder('greenhouse')
      .leftJoinAndSelect('greenhouse.tenant', 'tenant')
      .orderBy('greenhouse.name', OrderDirection.ASC);

    if (tenantId !== undefined) {
      qb.andWhere('greenhouse.tenantId = :tenantId', { tenantId });
    }

    return qb.getMany();
  }

  async findOneById(id: string, tenantId?: string): Promise<Greenhouse> {
    const greenhouse = await this.findOne(id, tenantId);
    if (!greenhouse) {
      throw new NotFoundException(`Greenhouse with ID ${id} not found`);
    }
    return greenhouse;
  }

  async createGreenhouse(
    input: CreateGreenhouseInput,
    tenantId: string,
  ): Promise<Greenhouse> {
    try {
      const greenhouse = this.greenhouseRepository.create({
        ...input,
        tenantId,
      });
      return await this.greenhouseRepository.save(greenhouse);
    } catch (error) {
      this.logger.error(
        `createGreenhouse failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create greenhouse');
    }
  }

  async updateGreenhouse(
    id: string,
    input: UpdateGreenhouseInput,
    tenantId?: string,
  ): Promise<Greenhouse> {
    const greenhouse = await this.findOneById(id, tenantId);
    // Explicit assignment (rather than Object.assign) so newly-added columns
    // are always picked up even if a stale build is cached and so that
    // false/null values are intentionally persisted instead of being skipped.
    if (input.name !== undefined) greenhouse.name = input.name;
    if (input.doorPosition !== undefined)
      greenhouse.doorPosition = input.doorPosition;
    if (input.xDimension !== undefined)
      greenhouse.xDimension = input.xDimension;
    if (input.yDimension !== undefined)
      greenhouse.yDimension = input.yDimension;
    if (input.bayCount !== undefined) greenhouse.bayCount = input.bayCount;
    if (input.isHorizontal !== undefined)
      greenhouse.isHorizontal = input.isHorizontal;
    if (input.hiddenInFarmOverview !== undefined)
      greenhouse.hiddenInFarmOverview = input.hiddenInFarmOverview;
    return this.greenhouseRepository.save(greenhouse);
  }

  // Soft delete (sets deletedAt via @DeleteDateColumn) and stamps the actor.
  async deleteGreenhouse(
    id: string,
    deletedById: string,
    tenantId?: string,
  ): Promise<void> {
    const greenhouse = await this.findOneById(id, tenantId);
    greenhouse.deletedById = deletedById;
    await this.greenhouseRepository.save(greenhouse);
    await this.greenhouseRepository.softDelete(id);
  }
}

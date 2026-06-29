import {
  Logger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDirection } from '@common/enums';
import { Crate } from './entities/crate.entity';
import { CreateCrateInput } from './dto';

/**
 * Tenant-scoped crate catalog backing the harvest sidebar's crate dropdown.
 * Reads return only live (non-soft-deleted) rows and are always scoped by the
 * caller's tenant.
 */
@Injectable()
export class CrateService {
  private readonly logger = new Logger(CrateService.name);

  constructor(
    @InjectRepository(Crate)
    private readonly crateRepository: Repository<Crate>,
  ) {}

  /**
   * Live crates for a tenant, lightest first. A `tenantId` of `undefined`
   * (VGREENS_ADMIN) is unscoped and returns every tenant's crates, matching the
   * other resolvers' admin behavior.
   */
  async findAllScoped(tenantId: string | undefined): Promise<Crate[]> {
    const qb = this.crateRepository
      .createQueryBuilder('crate')
      .orderBy('crate.weight', OrderDirection.ASC);
    if (tenantId !== undefined) {
      qb.where('crate.tenantId = :tenantId', { tenantId });
    }
    return qb.getMany();
  }

  /**
   * Resolve a single crate within the tenant scope. Returns `null` when it
   * doesn't exist or belongs to another tenant.
   */
  async findOneScoped(
    id: string,
    tenantId: string | undefined,
  ): Promise<Crate | null> {
    const qb = this.crateRepository
      .createQueryBuilder('crate')
      .where('crate.id = :id', { id });
    if (tenantId !== undefined) {
      qb.andWhere('crate.tenantId = :tenantId', { tenantId });
    }
    return qb.getOne();
  }

  /**
   * Add a crate for a tenant. Idempotent on (tenantId, weight): a matching live
   * crate is returned as-is and a soft-deleted one is revived, so the unique
   * index never collides and the dropdown keeps one option per weight.
   */
  async createCrate(
    input: CreateCrateInput,
    tenantId: string,
    createdById: string,
  ): Promise<Crate> {
    try {
      const existing = await this.crateRepository
        .createQueryBuilder('crate')
        .withDeleted()
        .where('crate.tenantId = :tenantId AND crate.weight = :weight', {
          tenantId,
          weight: input.weight,
        })
        .getOne();
      if (existing) {
        if (existing.deletedAt) {
          existing.deletedAt = null as unknown as Date | undefined;
          existing.deletedById = null as unknown as string | undefined;
          existing.createdById = existing.createdById ?? createdById;
          return await this.crateRepository.save(existing);
        }
        return existing;
      }

      const crate = this.crateRepository.create({
        tenantId,
        weight: input.weight,
        createdById,
      });
      return await this.crateRepository.save(crate);
    } catch (error) {
      this.logger.error(
        `createCrate failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create crate');
    }
  }
}

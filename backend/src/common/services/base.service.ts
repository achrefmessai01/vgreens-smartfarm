import { BaseEntity } from '../entities';
import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(tenantId?: string): Promise<T[]> {
    const query = this.repository.createQueryBuilder('entity');

    if (tenantId !== undefined) {
      query.where('entity.tenantId = :tenantId', { tenantId });
    }

    return query.getMany();
  }

  async findOne(id: string, tenantId?: string): Promise<T | null> {
    const query = this.repository
      .createQueryBuilder('entity')
      .where('entity.id = :id', { id });

    if (tenantId !== undefined) {
      query.andWhere('entity.tenantId = :tenantId', { tenantId });
    }

    return query.getOne();
  }

  async create(entity: Partial<T>, tenantId?: string): Promise<T> {
    const newEntity = this.repository.create({
      ...entity,
      tenantId: tenantId || entity.tenantId,
    } as DeepPartial<T>);
    return this.repository.save(newEntity);
  }

  async update(
    id: string,
    entity: DeepPartial<T>,
    tenantId?: string,
  ): Promise<T> {
    const existing = await this.findOne(id, tenantId);
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`);
    }

    const updatedEntity = this.repository.merge(existing, entity);
    return this.repository.save(updatedEntity);
  }

  async delete(id: string, tenantId?: string): Promise<void> {
    const whereCondition: FindOptionsWhere<T> = { id } as FindOptionsWhere<T>;
    if (tenantId !== undefined) {
      (whereCondition as { id: string; tenantId: string }).tenantId = tenantId;
    }

    await this.repository.delete(whereCondition);
  }
}

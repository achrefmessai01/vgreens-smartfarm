import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpsertFarmConfigInput } from './dto/upsert-farm-config.input';
import { TenantFarmConfig } from './entities/tenant-farm-config.entity';

export const DEFAULT_FARM_CONFIG = {
  bayCount: 13,
  polesMax: 10,
  chambersCount: 2,
} as const;

@Injectable()
export class TenantFarmConfigService {
  constructor(
    @InjectRepository(TenantFarmConfig)
    private readonly repo: Repository<TenantFarmConfig>,
  ) {}

  async findByTenant(tenantId: string): Promise<TenantFarmConfig | null> {
    return this.repo.findOne({ where: { tenantId } });
  }

  async upsert(
    input: UpsertFarmConfigInput,
    tenantId: string,
  ): Promise<TenantFarmConfig> {
    const existing = await this.repo.findOne({ where: { tenantId } });
    if (existing) {
      if (input.bayCount != null) existing.bayCount = input.bayCount;
      if (input.polesMax != null) existing.polesMax = input.polesMax;
      if (input.chambersCount != null)
        existing.chambersCount = input.chambersCount;
      return this.repo.save(existing);
    }
    return this.repo.save(
      this.repo.create({
        bayCount: input.bayCount ?? DEFAULT_FARM_CONFIG.bayCount,
        polesMax: input.polesMax ?? DEFAULT_FARM_CONFIG.polesMax,
        chambersCount: input.chambersCount ?? DEFAULT_FARM_CONFIG.chambersCount,
        tenantId,
      }),
    );
  }
}

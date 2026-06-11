import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertSensorConfigInput } from './dto';
import { SensorConfig } from './entities/sensor-config.entity';

@Injectable()
export class SensorConfigService {
  private readonly logger = new Logger(SensorConfigService.name);

  constructor(
    @InjectRepository(SensorConfig)
    private readonly repo: Repository<SensorConfig>,
  ) {}

  async findAllByTenant(tenantId: string): Promise<SensorConfig[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['greenhouseRef'],
      order: { device: 'ASC' },
    });
  }

  async findOneByDevice(
    tenantId: string,
    device: string,
  ): Promise<SensorConfig | null> {
    return this.repo.findOne({
      where: { tenantId, device },
      relations: ['greenhouseRef'],
    });
  }

  async upsert(
    input: UpsertSensorConfigInput,
    tenantId: string,
  ): Promise<SensorConfig> {
    const existing = await this.repo.findOne({
      where: { tenantId, device: input.device },
    });

    if (existing) {
      Object.assign(existing, {
        xPosition: input.xPosition ?? existing.xPosition,
        yPosition: input.yPosition ?? existing.yPosition,
        greenhouseId: input.greenhouseId ?? existing.greenhouseId,
        city: input.city ?? existing.city,
        hiddenInFarmOverview:
          input.hiddenInFarmOverview ?? existing.hiddenInFarmOverview ?? false,
      });
      await this.repo.save(existing);
      return this.findOneByDevice(tenantId, input.device) as Promise<SensorConfig>;
    }

    const config = this.repo.create({
      ...input,
      tenantId,
      xPosition: input.xPosition ?? null,
      yPosition: input.yPosition ?? null,
      hiddenInFarmOverview: input.hiddenInFarmOverview ?? false,
    });
    await this.repo.save(config);
    return this.findOneByDevice(tenantId, input.device) as Promise<SensorConfig>;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const config = await this.repo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException(`SensorConfig ${id} not found`);
    await this.repo.remove(config);
    return true;
  }
}

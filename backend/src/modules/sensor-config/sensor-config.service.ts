import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorConfig } from './entities/sensor-config.entity';
import { UpsertSensorConfigInput } from './dto';

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
      order: { device: 'ASC' },
    });
  }

  async findOneByDevice(
    tenantId: string,
    device: string,
  ): Promise<SensorConfig | null> {
    return this.repo.findOne({ where: { tenantId, device } });
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
        bay: input.bay ?? existing.bay,
        pole: input.pole ?? existing.pole,
        row: input.row ?? existing.row,
        greenhouse: input.greenhouse ?? existing.greenhouse,
        city: input.city ?? existing.city,
      });
      return this.repo.save(existing);
    }

    const config = this.repo.create({ ...input, tenantId });
    return this.repo.save(config);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const config = await this.repo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException(`SensorConfig ${id} not found`);
    await this.repo.remove(config);
    return true;
  }
}

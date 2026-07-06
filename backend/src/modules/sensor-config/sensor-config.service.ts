import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertSensorConfigInput } from './dto';
import { SensorConfig } from './entities/sensor-config.entity';
import { SOIL_DEVICE_REGEX } from './calibration.util';

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
        profile: input.profile ?? existing.profile,
        xPosition: input.xPosition ?? existing.xPosition,
        yPosition: input.yPosition ?? existing.yPosition,
        greenhouseId: input.greenhouseId ?? existing.greenhouseId,
        city: input.city ?? existing.city,
        hiddenInFarmOverview:
          input.hiddenInFarmOverview ?? existing.hiddenInFarmOverview ?? false,
      });
      await this.repo.save(existing);
      return this.findOneByDevice(tenantId, input.device);
    }

    const config = this.repo.create({
      ...input,
      tenantId,
      xPosition: input.xPosition ?? null,
      yPosition: input.yPosition ?? null,
      hiddenInFarmOverview: input.hiddenInFarmOverview ?? false,
    });
    await this.repo.save(config);
    return this.findOneByDevice(tenantId, input.device);
  }

  /**
   * Aligns stored configs with the profiles InfluxDB reports: sets `profile`
   * on every config whose device appears in the map with a different value.
   * Devices absent from the map keep their stored profile — no profile-tagged
   * points in the lookback window is not evidence the profile changed.
   * Returns the number of rows updated.
   */
  async applyDeviceProfiles(
    tenantId: string,
    profiles: Map<string, string>,
  ): Promise<number> {
    if (profiles.size === 0) return 0;
    const configs = await this.repo.find({ where: { tenantId } });
    const changed = configs.filter((config) => {
      const profile = profiles.get(config.device);
      return profile != null && profile !== config.profile;
    });
    if (changed.length === 0) return 0;
    for (const config of changed) {
      config.profile = profiles.get(config.device);
    }
    await this.repo.save(changed);
    this.logger.log(
      `Synced ${changed.length} sensor profile(s) from InfluxDB for tenant ${tenantId}`,
    );
    return changed.length;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const config = await this.repo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException(`SensorConfig ${id} not found`);
    await this.repo.remove(config);
    return true;
  }

  /**
   * The tenant's SOIL sensor configs (device matches `^Soil_`, case-insensitive)
   * that are NOT hidden from the farm overview — the set the calibration
   * dropdown offers and whose corrected values render on the map. Postgres LIKE
   * treats `_` as a wildcard, so the pattern escapes it (`Soil\_%`).
   */
  async findSoilByTenant(tenantId: string): Promise<SensorConfig[]> {
    return this.repo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.greenhouseRef', 'greenhouseRef')
      .where('config.tenantId = :tenantId', { tenantId })
      .andWhere('config.device ILIKE :pattern', { pattern: 'Soil\\_%' })
      .andWhere('config.hiddenInFarmOverview IS NOT TRUE')
      .orderBy('config.device', 'ASC')
      .getMany();
  }

  async findByIdForTenant(
    id: string,
    tenantId: string,
  ): Promise<SensorConfig | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['greenhouseRef'],
    });
  }

  /** True iff the device name identifies a soil sensor. */
  isSoilDevice(device: string): boolean {
    return SOIL_DEVICE_REGEX.test(device);
  }

  /**
   * Persists a single calibration bound on the sensor (`null` clears it). A
   * one-column UPDATE scoped by (id, tenantId) is atomic on its own — the
   * other bound and every other column are untouched. Returns the reloaded
   * config.
   */
  async saveCalibrationBound(
    id: string,
    tenantId: string,
    patch:
      | { avgDryReading: number | null }
      | { avgSaturatedReading: number | null },
  ): Promise<SensorConfig> {
    const result = await this.repo.update({ id, tenantId }, patch);
    if (!result.affected) {
      throw new NotFoundException(`SensorConfig ${id} not found`);
    }
    const updated = await this.findByIdForTenant(id, tenantId);
    if (!updated) {
      throw new NotFoundException(`SensorConfig ${id} not found`);
    }
    return updated;
  }
}

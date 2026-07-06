import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertSensorConfigInput } from './dto';
import { SensorConfig } from './entities/sensor-config.entity';
import { isSoilSensor } from './calibration.util';

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
    const changed: SensorConfig[] = [];
    for (const config of configs) {
      const profile = profiles.get(config.device);
      if (profile != null && profile !== config.profile) {
        config.profile = profile;
        changed.push(config);
      }
    }
    if (changed.length === 0) return 0;
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
   * The tenant's SOIL sensor configs that are NOT hidden from the farm
   * overview — the set the calibration dropdown offers and whose corrected
   * values render on the map. Soil detection is profile-based with a
   * device-name fallback (see `isSoilSensor`); filtering happens in JS so the
   * detection logic has a single home rather than a SQL twin. Tenant fleets
   * are tens of rows, so the full fetch is cheap.
   */
  async findSoilByTenant(tenantId: string): Promise<SensorConfig[]> {
    const configs = await this.findAllByTenant(tenantId);
    return configs.filter(
      (config) => isSoilSensor(config) && config.hiddenInFarmOverview !== true,
    );
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

  /**
   * True iff the config identifies a soil sensor — by its InfluxDB device
   * profile when known, by the legacy `Soil_` name prefix otherwise.
   */
  isSoilSensor(sensor: Pick<SensorConfig, 'device' | 'profile'>): boolean {
    return isSoilSensor(sensor);
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

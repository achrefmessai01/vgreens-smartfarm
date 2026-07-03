import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreenhouseService } from '@modules/greenhouse/greenhouse.service';
import { SensorConfig } from '@modules/sensor-config/entities/sensor-config.entity';
import { SOIL_DEVICE_REGEX } from '@modules/sensor-config/calibration.util';
import { CreateIrrigationCycleInput, UpdateIrrigationCycleInput } from './dto';
import { IrrigationCycle } from './entities/irrigation-cycle.entity';

@Injectable()
export class IrrigationCyclesService {
  constructor(
    @InjectRepository(IrrigationCycle)
    private readonly cycleRepo: Repository<IrrigationCycle>,
    @InjectRepository(SensorConfig)
    private readonly sensorConfigRepo: Repository<SensorConfig>,
    private readonly greenhouseService: GreenhouseService,
  ) {}

  async findAllByTenant(tenantId: string): Promise<IrrigationCycle[]> {
    return this.cycleRepo.find({
      where: { tenantId },
      relations: ['greenhouseRef'],
      order: { name: 'ASC' },
    });
  }

  async findByIdForTenant(
    id: string,
    tenantId: string,
  ): Promise<IrrigationCycle | null> {
    return this.cycleRepo.findOne({
      where: { id, tenantId },
      relations: ['greenhouseRef'],
    });
  }

  async create(
    input: CreateIrrigationCycleInput,
    tenantId: string,
  ): Promise<IrrigationCycle> {
    // Anchoring greenhouse must exist within the tenant (throws NotFound).
    await this.greenhouseService.findOneById(input.greenhouseId, tenantId);
    await this.assertNameAvailable(input.name, input.greenhouseId, tenantId);

    const cycle = this.cycleRepo.create({
      name: input.name.trim(),
      greenhouseId: input.greenhouseId,
      tenantId,
    });
    await this.cycleRepo.save(cycle);
    return this.findByIdForTenant(cycle.id, tenantId);
  }

  async update(
    id: string,
    input: UpdateIrrigationCycleInput,
    tenantId: string,
  ): Promise<IrrigationCycle> {
    const cycle = await this.requireCycle(id, tenantId);
    if (input.name !== undefined && input.name.trim() !== cycle.name) {
      await this.assertNameAvailable(
        input.name,
        cycle.greenhouseId ?? null,
        tenantId,
        id,
      );
      cycle.name = input.name.trim();
      await this.cycleRepo.save(cycle);
    }
    return this.findByIdForTenant(id, tenantId);
  }

  // Deleting a cycle with sensors still assigned is BLOCKED (decided over
  // silent unassign) so a cycle never vanishes out from under its sensors —
  // unassign in the configuration UI first.
  async delete(id: string, tenantId: string): Promise<boolean> {
    const cycle = await this.requireCycle(id, tenantId);
    const assigned = await this.sensorConfigRepo.count({
      where: { tenantId, irrigationCycleId: id },
    });
    if (assigned > 0) {
      throw new ConflictException(
        `Irrigation cycle "${cycle.name}" still has ${assigned} sensor(s) assigned. Unassign them first.`,
      );
    }
    await this.cycleRepo.remove(cycle);
    return true;
  }

  /**
   * Assigns a soil sensor to a cycle (or unassigns it with `null`). Enforces:
   * the sensor is a soil sensor, both rows belong to the tenant, and the
   * sensor sits in the cycle's greenhouse (a cycle only irrigates its own
   * greenhouse, so cross-greenhouse grouping is always a config mistake).
   */
  async assignSensor(
    sensorConfigId: string,
    irrigationCycleId: string | null,
    tenantId: string,
  ): Promise<SensorConfig> {
    const sensor = await this.sensorConfigRepo.findOne({
      where: { id: sensorConfigId, tenantId },
      relations: ['greenhouseRef'],
    });
    if (!sensor) {
      throw new NotFoundException(`SensorConfig ${sensorConfigId} not found`);
    }
    if (!SOIL_DEVICE_REGEX.test(sensor.device)) {
      throw new BadRequestException(
        `Sensor "${sensor.device}" is not a soil sensor and cannot join an irrigation cycle`,
      );
    }

    if (irrigationCycleId !== null) {
      const cycle = await this.requireCycle(irrigationCycleId, tenantId);
      if (!cycle.greenhouseId) {
        throw new BadRequestException(
          `Irrigation cycle "${cycle.name}" has no greenhouse; reassign it before adding sensors`,
        );
      }
      if (sensor.greenhouseId !== cycle.greenhouseId) {
        throw new BadRequestException(
          `Sensor "${sensor.device}" is not in the same greenhouse as irrigation cycle "${cycle.name}"`,
        );
      }
    }

    sensor.irrigationCycleId = irrigationCycleId;
    await this.sensorConfigRepo.save(sensor);
    return sensor;
  }

  /** The cycle's assigned sensors (resolver field), ordered by device name. */
  async findSensorsByCycle(
    cycleId: string,
    tenantId: string,
  ): Promise<SensorConfig[]> {
    return this.sensorConfigRepo.find({
      where: { tenantId, irrigationCycleId: cycleId },
      relations: ['greenhouseRef'],
      order: { device: 'ASC' },
    });
  }

  private async requireCycle(
    id: string,
    tenantId: string,
  ): Promise<IrrigationCycle> {
    const cycle = await this.findByIdForTenant(id, tenantId);
    if (!cycle) {
      throw new NotFoundException(`Irrigation cycle ${id} not found`);
    }
    return cycle;
  }

  // Name must be unique per greenhouse (case-insensitive) so the farm-overview
  // dropdown never shows two identical entries for one greenhouse.
  private async assertNameAvailable(
    name: string,
    greenhouseId: string | null,
    tenantId: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.cycleRepo
      .createQueryBuilder('cycle')
      .where('cycle.tenantId = :tenantId', { tenantId })
      .andWhere('LOWER(cycle.name) = LOWER(:name)', { name: name.trim() });
    if (greenhouseId === null) {
      qb.andWhere('cycle.greenhouseId IS NULL');
    } else {
      qb.andWhere('cycle.greenhouseId = :greenhouseId', { greenhouseId });
    }
    if (excludeId) {
      qb.andWhere('cycle.id != :excludeId', { excludeId });
    }
    const clash = await qb.getOne();
    if (clash) {
      throw new ConflictException(
        `An irrigation cycle named "${name.trim()}" already exists for this greenhouse`,
      );
    }
  }
}

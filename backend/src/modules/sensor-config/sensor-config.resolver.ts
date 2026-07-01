import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Float,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import {
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { SensorConfigService } from './sensor-config.service';
import { SensorConfig } from './entities/sensor-config.entity';
import { CalibrationReading, UpsertSensorConfigInput } from './dto';
import {
  computeCorrectedMoisture,
  isSensorCalibrated,
  SOIL_MOISTURE_FIELD,
} from './calibration.util';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';
import {
  DeviceActivityPoint,
  DeviceStatus,
  DeviceStatusInput,
  DeviceStatusRange,
  DEVICE_STATUS_RANGE_FLUX,
  DEVICE_STATUS_RANGE_WINDOW,
  windowForDurationMs,
} from '@modules/influxdb/dto';
import { TenantsService } from '@modules/tenants/tenants.service';
import { GreenhouseService } from '@modules/greenhouse/greenhouse.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver(() => SensorConfig)
export class SensorConfigResolver {
  constructor(
    private readonly sensorConfigService: SensorConfigService,
    private readonly influxDBService: InfluxDBService,
    private readonly tenantsService: TenantsService,
    private readonly greenhouseService: GreenhouseService,
  ) {}

  @Query(() => [SensorConfig], { name: 'sensorConfigs' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig[]> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.sensorConfigService.findAllByTenant(targetTenantId);
  }

  // The tenant's soil sensor configs (not hidden), powering the calibration
  // dropdown AND the map's corrected-value rendering. Read-only and available
  // to every role: corrected values are shown to all users, and listing sensors
  // is not a privileged action. The privileged part — capturing calibration —
  // is the mutations below, which enforce admin server-side.
  @Query(() => [SensorConfig], { name: 'soilSensorConfigs' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async soilSensorConfigs(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig[]> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.sensorConfigService.findSoilByTenant(targetTenantId);
  }

  // Polling query for the capture flow: the first REAL soil-moisture datapoint
  // for this sensor at or after `since` (an ISO timestamp the UI stamps when
  // the operator presses calibrate), or null if the sensor hasn't transmitted
  // yet. Admin-only, mirroring the capture mutations it drives.
  @Query(() => CalibrationReading, {
    name: 'calibrationReading',
    nullable: true,
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async calibrationReading(
    @CurrentUser() currentUser: User,
    @Args('sensorConfigId', { type: () => ID }) sensorConfigId: string,
    @Args('since', { type: () => String }) since: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<CalibrationReading | null> {
    const { bucketName, device } = await this.resolveCalibrationTarget(
      currentUser,
      sensorConfigId,
      tenantId,
    );
    return this.influxDBService.getEarliestReadingSince(bucketName, {
      device,
      field: SOIL_MOISTURE_FIELD,
      since,
    });
  }

  @Query(() => [String], { name: 'sensorDevices' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async uniqueDevices(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<string[]> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) return [];
    return this.influxDBService.getUniqueDevices(tenant.influxBucketName);
  }

  @Query(() => [String], { name: 'greenhouseOptions' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async uniqueGreenhouses(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<string[]> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) return [];
    return this.influxDBService.getUniqueGreenhouses(tenant.influxBucketName);
  }

  @Query(() => [DeviceStatus], { name: 'deviceStatuses' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deviceStatuses(
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input?: DeviceStatusInput,
  ): Promise<DeviceStatus[]> {
    const targetTenantId = this.resolveTargetTenantId(
      currentUser,
      input?.tenantId,
    );
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) return [];

    const { start, stop } = this.resolveDeviceRange(input);
    const statuses = await this.influxDBService.getDeviceStatusInventory(
      tenant.influxBucketName,
      { start, stop },
    );

    // Merge in per-device settings, and surface configured-but-silent devices
    // as `never-seen` rows so the dashboard lists the full fleet.
    const configs =
      await this.sensorConfigService.findAllByTenant(targetTenantId);
    const byDevice = new Map(statuses.map((s) => [s.device, s]));
    for (const cfg of configs) {
      const settings = {
        greenhouse: cfg.greenhouseRef?.name ?? undefined,
        xPosition: cfg.xPosition ?? undefined,
        yPosition: cfg.yPosition ?? undefined,
        city: cfg.city ?? undefined,
        hiddenInFarmOverview: cfg.hiddenInFarmOverview ?? undefined,
      };
      const existing = byDevice.get(cfg.device);
      if (existing) {
        Object.assign(existing, settings);
      } else {
        const status: DeviceStatus = {
          device: cfg.device,
          state: 'never-seen',
          deviceClass: cfg.device.startsWith('vgreens-') ? 'edge' : 'regular',
          messageTypes: [],
          realMessageTypes: [],
          realDataPoints: 0,
          heartbeatDataPoints: 0,
          lastValues: [],
          ...settings,
        };
        byDevice.set(cfg.device, status);
      }
    }

    return [...byDevice.values()].sort((a, b) =>
      a.device.localeCompare(b.device),
    );
  }

  @Query(() => [DeviceActivityPoint], { name: 'deviceActivitySeries' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deviceActivitySeries(
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input?: DeviceStatusInput,
  ): Promise<DeviceActivityPoint[]> {
    const targetTenantId = this.resolveTargetTenantId(
      currentUser,
      input?.tenantId,
    );
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) return [];

    const { start, stop, windowEvery } = this.resolveDeviceRange(input);
    return this.influxDBService.getDeviceActivitySeries(
      tenant.influxBucketName,
      { start, stop, windowEvery },
    );
  }

  /**
   * Resolves a device-status range request to Flux inputs. A valid custom
   * `start`/`stop` pair (ISO, stop after start) wins; otherwise the relative
   * `range` preset is used.
   */
  private resolveDeviceRange(input?: DeviceStatusInput): {
    start: string;
    stop?: string;
    windowEvery: string;
  } {
    if (input?.start && input?.stop) {
      const s = new Date(input.start).getTime();
      const e = new Date(input.stop).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e > s) {
        return {
          start: input.start,
          stop: input.stop,
          windowEvery: windowForDurationMs(e - s),
        };
      }
    }
    const range = input?.range ?? DeviceStatusRange.SEVEN_DAYS;
    return {
      start: DEVICE_STATUS_RANGE_FLUX[range],
      windowEvery: DEVICE_STATUS_RANGE_WINDOW[range],
    };
  }

  @Mutation(() => SensorConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async upsertSensorConfig(
    @CurrentUser() currentUser: User,
    @Args('input') input: UpsertSensorConfigInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    await this.validatePositionRange(targetTenantId, input);
    return this.sensorConfigService.upsert(input, targetTenantId);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteSensorConfig(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<boolean> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.sensorConfigService.delete(id, targetTenantId);
  }

  private resolveTargetTenantId(currentUser: User, tenantId?: string): string {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;

    if (!targetTenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return targetTenantId;
  }

  private async validatePositionRange(
    tenantId: string,
    input: UpsertSensorConfigInput,
  ): Promise<void> {
    const hasPositionInput = input.xPosition != null || input.yPosition != null;
    if (!hasPositionInput) return;

    const existingConfig = await this.sensorConfigService.findOneByDevice(
      tenantId,
      input.device,
    );
    const greenhouseId = input.greenhouseId ?? existingConfig?.greenhouseId;
    if (!greenhouseId) return;

    const greenhouse = await this.greenhouseService.findOne(
      greenhouseId,
      tenantId,
    );

    // The sensor may not reference a configured greenhouse yet — skip bounds
    // validation rather than blocking the save.
    if (!greenhouse) {
      return;
    }

    if (
      input.xPosition != null &&
      greenhouse.xDimension != null &&
      input.xPosition > greenhouse.xDimension
    ) {
      throw new BadRequestException(
        `xPosition must be between 0 and ${greenhouse.xDimension} for greenhouse "${greenhouse.name}"`,
      );
    }

    if (
      input.yPosition != null &&
      greenhouse.yDimension != null &&
      input.yPosition > greenhouse.yDimension
    ) {
      throw new BadRequestException(
        `yPosition must be between 0 and ${greenhouse.yDimension} for greenhouse "${greenhouse.name}"`,
      );
    }
  }

  // Capture the DRY calibration bound: average the real reading(s) since the
  // operator pressed calibrate and persist to avgDryReading. Capture policy is
  // "exactly one fresh point" (soil sensors transmit ~every 10 min over
  // LoRaWAN, and waiting for several would mean 30–50 min), so we take the
  // first genuine post-`since` datapoint. Admin-only.
  @Mutation(() => SensorConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async captureDryCalibration(
    @CurrentUser() currentUser: User,
    @Args('sensorConfigId', { type: () => ID }) sensorConfigId: string,
    @Args('since', { type: () => String }) since: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig> {
    const { targetTenantId, value } = await this.captureReading(
      currentUser,
      sensorConfigId,
      since,
      tenantId,
    );
    return this.sensorConfigService.saveCalibrationBound(
      sensorConfigId,
      targetTenantId,
      { avgDryReading: value },
    );
  }

  // Capture the SATURATED calibration bound (avgSaturatedReading). Same capture
  // logic as dry; admin-only.
  @Mutation(() => SensorConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async captureSaturatedCalibration(
    @CurrentUser() currentUser: User,
    @Args('sensorConfigId', { type: () => ID }) sensorConfigId: string,
    @Args('since', { type: () => String }) since: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig> {
    const { targetTenantId, value } = await this.captureReading(
      currentUser,
      sensorConfigId,
      since,
      tenantId,
    );
    return this.sensorConfigService.saveCalibrationBound(
      sensorConfigId,
      targetTenantId,
      { avgSaturatedReading: value },
    );
  }

  // Expose the linked greenhouse's name as `greenhouse` so existing name-based
  // consumers (farm overview, sensor map, default positions) keep working.
  @ResolveField(() => String, { name: 'greenhouse', nullable: true })
  greenhouse(@Parent() config: SensorConfig): string | null {
    return config.greenhouseRef?.name ?? null;
  }

  // True once both bounds are set and distinct — a usable calibration.
  @ResolveField(() => Boolean, { name: 'isCalibrated' })
  isCalibrated(@Parent() config: SensorConfig): boolean {
    return isSensorCalibrated(config.avgDryReading, config.avgSaturatedReading);
  }

  // Live corrected value: fetch the sensor's current raw soil-moisture reading
  // and apply the two-point calibration. NOT persisted — recomputed per query.
  // Returns the raw reading uncorrected while uncalibrated, and null when the
  // sensor has no recent reading or the calibration is degenerate
  // (dry === saturated). Only computed for soil sensors.
  @ResolveField(() => Float, { name: 'correctedValue', nullable: true })
  async correctedValue(@Parent() config: SensorConfig): Promise<number | null> {
    if (!this.sensorConfigService.isSoilDevice(config.device)) return null;
    if (!config.tenantId) return null;
    const tenant = await this.tenantsService.findOne(config.tenantId);
    if (!tenant?.influxBucketName) return null;
    const raw = await this.influxDBService.getLatestReadingValue(
      tenant.influxBucketName,
      { device: config.device, field: SOIL_MOISTURE_FIELD },
    );
    if (raw == null) return null;
    return computeCorrectedMoisture(
      raw,
      config.avgDryReading,
      config.avgSaturatedReading,
    );
  }

  // Shared: resolve the sensor's tenant + Influx bucket + device, verifying the
  // sensor exists, belongs to the tenant, and is a soil sensor.
  private async resolveCalibrationTarget(
    currentUser: User,
    sensorConfigId: string,
    tenantId?: string,
  ): Promise<{ targetTenantId: string; bucketName: string; device: string }> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    const config = await this.sensorConfigService.findByIdForTenant(
      sensorConfigId,
      targetTenantId,
    );
    if (!config) {
      throw new NotFoundException(`SensorConfig ${sensorConfigId} not found`);
    }
    if (!this.sensorConfigService.isSoilDevice(config.device)) {
      throw new BadRequestException(
        `Sensor "${config.device}" is not a soil sensor and cannot be calibrated`,
      );
    }
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) {
      throw new BadRequestException(
        'Tenant has no InfluxDB bucket configured; cannot read sensor data',
      );
    }
    return {
      targetTenantId,
      bucketName: tenant.influxBucketName,
      device: config.device,
    };
  }

  // Shared capture: take the first real reading since `since` and hand back the
  // value to persist. Throws if the sensor hasn't transmitted yet.
  private async captureReading(
    currentUser: User,
    sensorConfigId: string,
    since: string,
    tenantId?: string,
  ): Promise<{ targetTenantId: string; value: number }> {
    const { targetTenantId, bucketName, device } =
      await this.resolveCalibrationTarget(
        currentUser,
        sensorConfigId,
        tenantId,
      );
    const reading = await this.influxDBService.getEarliestReadingSince(
      bucketName,
      { device, field: SOIL_MOISTURE_FIELD, since },
    );
    if (!reading) {
      throw new BadRequestException(
        'No sensor reading received yet. The sensor transmits roughly every ' +
          '10 minutes — wait for the next reading and try again.',
      );
    }
    return { targetTenantId, value: reading.value };
  }
}

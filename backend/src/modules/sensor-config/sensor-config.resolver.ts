import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { SensorConfigService } from './sensor-config.service';
import { SensorConfig } from './entities/sensor-config.entity';
import { UpsertSensorConfigInput } from './dto';
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
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
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

  // Expose the linked greenhouse's name as `greenhouse` so existing name-based
  // consumers (farm overview, sensor map, default positions) keep working.
  @ResolveField(() => String, { name: 'greenhouse', nullable: true })
  greenhouse(@Parent() config: SensorConfig): string | null {
    return config.greenhouseRef?.name ?? null;
  }
}

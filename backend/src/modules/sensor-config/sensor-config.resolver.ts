import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { SensorConfigService } from './sensor-config.service';
import { SensorConfig } from './entities/sensor-config.entity';
import { UpsertSensorConfigInput } from './dto';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';
import { TenantsService } from '@modules/tenants/tenants.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver(() => SensorConfig)
export class SensorConfigResolver {
  constructor(
    private readonly sensorConfigService: SensorConfigService,
    private readonly influxDBService: InfluxDBService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Query(() => [SensorConfig], { name: 'sensorConfigs' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig[]> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId!)
        : currentUser.tenantId!;
    return this.sensorConfigService.findAllByTenant(targetTenantId);
  }

  @Query(() => [String], { name: 'sensorDevices' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async uniqueDevices(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<string[]> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId!)
        : currentUser.tenantId!;
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
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId!)
        : currentUser.tenantId!;
    const tenant = await this.tenantsService.findOne(targetTenantId);
    if (!tenant?.influxBucketName) return [];
    return this.influxDBService.getUniqueGreenhouses(tenant.influxBucketName);
  }

  @Mutation(() => SensorConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async upsertSensorConfig(
    @CurrentUser() currentUser: User,
    @Args('input') input: UpsertSensorConfigInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId!)
        : currentUser.tenantId!;
    return this.sensorConfigService.upsert(input, targetTenantId);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteSensorConfig(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<boolean> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId!)
        : currentUser.tenantId!;
    return this.sensorConfigService.delete(id, targetTenantId);
  }
}

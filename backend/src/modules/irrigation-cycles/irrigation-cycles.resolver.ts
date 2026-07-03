import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { CurrentUser, Roles } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { SensorConfig } from '@modules/sensor-config/entities/sensor-config.entity';
import { CreateIrrigationCycleInput, UpdateIrrigationCycleInput } from './dto';
import { IrrigationCycle } from './entities/irrigation-cycle.entity';
import { IrrigationCyclesService } from './irrigation-cycles.service';

/**
 * Irrigation cycles group a greenhouse's soil sensors for calibration: the
 * farm-overview dropdown lists cycles, and the sidebar calibrates every
 * assigned sensor. Everything here is admin-only — cycles exist purely to
 * drive calibration, which is itself an admin action.
 */
@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver(() => IrrigationCycle)
export class IrrigationCyclesResolver {
  constructor(private readonly cyclesService: IrrigationCyclesService) {}

  @Query(() => [IrrigationCycle], { name: 'irrigationCycles' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async irrigationCycles(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<IrrigationCycle[]> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.cyclesService.findAllByTenant(targetTenantId);
  }

  @Mutation(() => IrrigationCycle)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createIrrigationCycle(
    @CurrentUser() currentUser: User,
    @Args('input') input: CreateIrrigationCycleInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<IrrigationCycle> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.cyclesService.create(input, targetTenantId);
  }

  @Mutation(() => IrrigationCycle)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateIrrigationCycle(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateIrrigationCycleInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<IrrigationCycle> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.cyclesService.update(id, input, targetTenantId);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteIrrigationCycle(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<boolean> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.cyclesService.delete(id, targetTenantId);
  }

  // Assign a soil sensor to a cycle; pass irrigationCycleId: null to unassign.
  @Mutation(() => SensorConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async assignSensorToIrrigationCycle(
    @CurrentUser() currentUser: User,
    @Args('sensorConfigId', { type: () => ID }) sensorConfigId: string,
    @Args('irrigationCycleId', { type: () => ID, nullable: true })
    irrigationCycleId?: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<SensorConfig> {
    const targetTenantId = this.resolveTargetTenantId(currentUser, tenantId);
    return this.cyclesService.assignSensor(
      sensorConfigId,
      irrigationCycleId ?? null,
      targetTenantId,
    );
  }

  // The linked greenhouse's name, mirroring SensorConfig's `greenhouse` field.
  @ResolveField(() => String, { name: 'greenhouse', nullable: true })
  greenhouse(@Parent() cycle: IrrigationCycle): string | null {
    return cycle.greenhouseRef?.name ?? null;
  }

  // The cycle's assigned soil sensors — the rows the calibration sidebar
  // renders. SensorConfig's own field resolvers (isCalibrated, greenhouse, …)
  // apply to these as usual.
  @ResolveField(() => [SensorConfig], { name: 'sensors' })
  async sensors(@Parent() cycle: IrrigationCycle): Promise<SensorConfig[]> {
    return this.cyclesService.findSensorsByCycle(cycle.id, cycle.tenantId);
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
}

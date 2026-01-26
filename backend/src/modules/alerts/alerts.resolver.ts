import { UserRole } from '@common/enums';
import { Alert } from './entities/alert.entity';
import { AlertsService } from './alerts.service';
import { Roles, CurrentUser } from '@common/decorators';
import { CreateAlertInput, UpdateAlertInput } from './dto';
import { User } from '@modules/users/entities/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Alert)
export class AlertsResolver {
  constructor(private readonly alertsService: AlertsService) {}

  @Query(() => [Alert], { name: 'alerts' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(@CurrentUser() currentUser: User): Promise<Alert[]> {
    if (currentUser.role === UserRole.VGREENS_ADMIN) {
      return this.alertsService.findAll();
    }

    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.alertsService.findAllByTenant(currentUser.tenantId);
  }

  @Query(() => Alert, { name: 'alert', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Alert | null> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.alertsService.findOneById(id, tenantId);
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createAlert(
    @Args('input') input: CreateAlertInput,
    @CurrentUser() currentUser: User,
  ): Promise<Alert> {
    const tenantId = input.tenantId || currentUser.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.alertsService.createAlert(input, tenantId);
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async updateAlert(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAlertInput,
    @CurrentUser() currentUser: User,
  ): Promise<Alert> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.alertsService.updateAlert(id, input, tenantId);
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async acknowledgeAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Alert> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.alertsService.acknowledgeAlert(id, tenantId);
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async resolveAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Alert> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.alertsService.resolveAlert(id, tenantId);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    await this.alertsService.deleteAlert(id, tenantId);
    return true;
  }
}

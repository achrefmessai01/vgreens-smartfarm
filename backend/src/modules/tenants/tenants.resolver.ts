import { CurrentUser, Roles } from '@common/decorators';
import { UserRole } from '@common/enums';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { User } from '@modules/users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTenantInput, UpdateTenantInput } from './dto';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';

@Resolver(() => Tenant)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class TenantsResolver {
  constructor(private readonly tenantsService: TenantsService) {}

  @Query(() => [Tenant])
  @Roles(UserRole.VGREENS_ADMIN)
  async tenants(): Promise<Tenant[]> {
    return this.tenantsService.findAll();
  }

  @Query(() => Tenant, { nullable: true })
  @Roles(UserRole.VGREENS_ADMIN)
  async tenant(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Tenant | null> {
    return this.tenantsService.findOne(id);
  }

  @Query(() => [String], { name: 'tenantGreenhouses' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async tenantGreenhouses(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<string[]> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;
    const tenant = await this.tenantsService.findOne(targetTenantId);
    return tenant?.greenhouses.map((gh) => gh.name) ?? [];
  }

  @Mutation(() => Tenant)
  @Roles(UserRole.VGREENS_ADMIN)
  async createTenant(
    @Args('input') createTenantInput: CreateTenantInput,
  ): Promise<Tenant> {
    return this.tenantsService.create(createTenantInput);
  }

  @Mutation(() => Tenant)
  @Roles(UserRole.VGREENS_ADMIN)
  async updateTenant(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateTenantInput: UpdateTenantInput,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, updateTenantInput);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN)
  async deleteTenant(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.tenantsService.delete(id);
  }

  @Mutation(() => Tenant)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async setTenantDisabledSensorFields(
    @CurrentUser() currentUser: User,
    @Args('fields', { type: () => [String] }) fields: string[],
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<Tenant> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;
    return this.tenantsService.setDisabledSensorFields(targetTenantId, fields);
  }
}

import { UserRole } from '@common/enums';
import { Roles } from '@common/decorators';
import { UseGuards } from '@nestjs/common';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { CreateTenantInput, UpdateTenantInput } from './dto';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

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
}

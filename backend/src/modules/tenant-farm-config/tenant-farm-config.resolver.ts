import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { TenantFarmConfigService } from './tenant-farm-config.service';
import { TenantFarmConfig } from './entities/tenant-farm-config.entity';
import { UpsertFarmConfigInput } from './dto/upsert-farm-config.input';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver(() => TenantFarmConfig)
export class TenantFarmConfigResolver {
  constructor(private readonly service: TenantFarmConfigService) {}

  @Query(() => TenantFarmConfig, { name: 'farmConfig', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findFarmConfig(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<TenantFarmConfig | null> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;
    return this.service.findByTenant(targetTenantId);
  }

  @Mutation(() => TenantFarmConfig)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async upsertFarmConfig(
    @CurrentUser() currentUser: User,
    @Args('input') input: UpsertFarmConfigInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<TenantFarmConfig> {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;
    return this.service.upsert(input, targetTenantId);
  }
}

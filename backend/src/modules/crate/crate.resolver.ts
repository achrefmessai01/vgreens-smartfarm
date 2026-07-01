import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { resolveTenantId } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { Crate } from './entities/crate.entity';
import { CrateService } from './crate.service';
import { CreateCrateInput } from './dto';

/**
 * Tenant-scoped crate API for the harvest sidebar's crate dropdown. Every query
 * filters by the caller's tenant so a tenant can never see another's crates —
 * and an admin drilling into a tenant (via the global selector's `tenantId`)
 * sees only that tenant's crates, so a crate picked here always resolves against
 * the same tenant when a harvest/batch references it. Reads and create are open
 * to all authenticated roles because harvesters add a crate inline while logging
 * a harvest.
 */
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Crate)
export class CrateResolver {
  constructor(private readonly crateService: CrateService) {}

  @Query(() => [Crate], { name: 'crates' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Crate[]> {
    return this.crateService.findAllScoped(
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Mutation(() => Crate)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createCrate(
    @Args('input') input: CreateCrateInput,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Crate> {
    // Admins create into the tenant they're scoped to (the selector's tenantId);
    // non-admins are pinned to their own tenant.
    const scopedTenantId = resolveTenantId(currentUser, tenantId);
    if (!scopedTenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!currentUser.id) {
      throw new Error('User ID is required');
    }
    return this.crateService.createCrate(
      input,
      scopedTenantId,
      currentUser.id,
    );
  }
}

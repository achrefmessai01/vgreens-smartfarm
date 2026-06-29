import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { User } from '@modules/users/entities/user.entity';
import { Crate } from './entities/crate.entity';
import { CrateService } from './crate.service';
import { CreateCrateInput } from './dto';

/**
 * Tenant-scoped crate API for the harvest sidebar's crate dropdown. Every query
 * filters by the caller's tenant so a tenant can never see another's crates.
 * Reads and create are open to all authenticated roles because harvesters add a
 * crate inline while logging a harvest.
 */
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Crate)
export class CrateResolver {
  constructor(private readonly crateService: CrateService) {}

  private resolveTenantId(currentUser: User): string | undefined {
    if (currentUser.role === UserRole.VGREENS_ADMIN) return undefined;
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return currentUser.tenantId;
  }

  @Query(() => [Crate], { name: 'crates' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(@CurrentUser() currentUser: User): Promise<Crate[]> {
    return this.crateService.findAllScoped(this.resolveTenantId(currentUser));
  }

  @Mutation(() => Crate)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createCrate(
    @Args('input') input: CreateCrateInput,
    @CurrentUser() currentUser: User,
  ): Promise<Crate> {
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!currentUser.id) {
      throw new Error('User ID is required');
    }
    return this.crateService.createCrate(
      input,
      currentUser.tenantId,
      currentUser.id,
    );
  }
}

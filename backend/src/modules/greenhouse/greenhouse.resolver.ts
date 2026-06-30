import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { resolveTenantId } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { Greenhouse } from './entities/greenhouse.entity';
import { GreenhouseService } from './greenhouse.service';
import { CreateGreenhouseInput, UpdateGreenhouseInput } from './dto';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Greenhouse)
export class GreenhouseResolver {
  constructor(private readonly greenhouseService: GreenhouseService) {}

  @Query(() => [Greenhouse], { name: 'greenhouses' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Greenhouse[]> {
    // Tenant users are always pinned to their own tenant; admins may pass a
    // tenantId to scope to one tenant (omit it to list every tenant's).
    return this.greenhouseService.findAllScoped(
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Query(() => Greenhouse, { name: 'greenhouse', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Greenhouse | null> {
    return this.greenhouseService.findOne(
      id,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Greenhouse)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createGreenhouse(
    @Args('input') input: CreateGreenhouseInput,
    @CurrentUser() currentUser: User,
  ): Promise<Greenhouse> {
    // Admins must select a tenant explicitly (via input.tenantId); non-admins
    // are pinned to their own tenant regardless of the value supplied.
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? input.tenantId
        : currentUser.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.greenhouseService.createGreenhouse(input, tenantId);
  }

  @Mutation(() => Greenhouse)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateGreenhouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGreenhouseInput,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Greenhouse> {
    return this.greenhouseService.updateGreenhouse(
      id,
      input,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteGreenhouse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.greenhouseService.deleteGreenhouse(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId, false),
    );
    return true;
  }
}

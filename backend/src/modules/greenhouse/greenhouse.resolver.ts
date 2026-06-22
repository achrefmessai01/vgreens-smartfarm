import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { User } from '@modules/users/entities/user.entity';
import { Greenhouse } from './entities/greenhouse.entity';
import { GreenhouseService } from './greenhouse.service';
import { CreateGreenhouseInput, UpdateGreenhouseInput } from './dto';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Greenhouse)
export class GreenhouseResolver {
  constructor(private readonly greenhouseService: GreenhouseService) {}

  // Admins see every tenant's greenhouses (tenantId undefined); tenant users are
  // scoped to their own tenant — same pattern as HarvestsResolver.
  private resolveTenantId(currentUser: User): string | undefined {
    if (currentUser.role === UserRole.VGREENS_ADMIN) return undefined;
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return currentUser.tenantId;
  }

  @Query(() => [Greenhouse], { name: 'greenhouses' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Greenhouse[]> {
    // Tenant users are always pinned to their own tenant; admins may pass a
    // tenantId to scope to one tenant (omit it to list every tenant's).
    const scoped = this.resolveTenantId(currentUser);
    const effective = scoped ?? tenantId ?? undefined;
    return this.greenhouseService.findAllScoped(effective);
  }

  @Query(() => Greenhouse, { name: 'greenhouse', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Greenhouse | null> {
    return this.greenhouseService.findOne(
      id,
      this.resolveTenantId(currentUser),
    );
  }

  @Mutation(() => Greenhouse)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createGreenhouse(
    @Args('input') input: CreateGreenhouseInput,
    @CurrentUser() currentUser: User,
  ): Promise<Greenhouse> {
    const tenantId = input.tenantId ?? currentUser.tenantId;
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
  ): Promise<Greenhouse> {
    return this.greenhouseService.updateGreenhouse(
      id,
      input,
      this.resolveTenantId(currentUser),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteGreenhouse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.greenhouseService.deleteGreenhouse(
      id,
      currentUser.id,
      this.resolveTenantId(currentUser),
    );
    return true;
  }
}

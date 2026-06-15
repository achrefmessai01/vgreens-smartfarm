import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { User } from '@modules/users/entities/user.entity';
import { GreenhouseCrop } from './entities/greenhouse-crop.entity';
import { GreenhouseCropService } from './greenhouse-crop.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => GreenhouseCrop)
export class GreenhouseCropResolver {
  constructor(
    private readonly greenhouseCropService: GreenhouseCropService,
  ) {}

  // Admins act across tenants (tenantId undefined); tenant admins are scoped to
  // their own tenant — same pattern as the greenhouse/batch resolvers.
  private resolveTenantId(currentUser: User): string | undefined {
    if (currentUser.role === UserRole.VGREENS_ADMIN) return undefined;
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return currentUser.tenantId;
  }

  @Mutation(() => GreenhouseCrop)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async assignCropToGreenhouse(
    @Args('greenhouseId', { type: () => ID }) greenhouseId: string,
    @Args('cropId', { type: () => ID }) cropId: string,
    @CurrentUser() currentUser: User,
  ): Promise<GreenhouseCrop> {
    return this.greenhouseCropService.assign(
      greenhouseId,
      cropId,
      this.resolveTenantId(currentUser),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async unassignCropFromGreenhouse(
    @Args('greenhouseId', { type: () => ID }) greenhouseId: string,
    @Args('cropId', { type: () => ID }) cropId: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    return this.greenhouseCropService.unassign(
      greenhouseId,
      cropId,
      this.resolveTenantId(currentUser),
    );
  }
}

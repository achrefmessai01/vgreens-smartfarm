import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { resolveTenantId } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { GreenhouseCrop } from './entities/greenhouse-crop.entity';
import { GreenhouseCropService } from './greenhouse-crop.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => GreenhouseCrop)
export class GreenhouseCropResolver {
  constructor(private readonly greenhouseCropService: GreenhouseCropService) {}

  @Mutation(() => GreenhouseCrop)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async assignCropToGreenhouse(
    @Args('greenhouseId', { type: () => ID }) greenhouseId: string,
    @Args('cropId', { type: () => ID }) cropId: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<GreenhouseCrop> {
    return this.greenhouseCropService.assign(
      greenhouseId,
      cropId,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async unassignCropFromGreenhouse(
    @Args('greenhouseId', { type: () => ID }) greenhouseId: string,
    @Args('cropId', { type: () => ID }) cropId: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    return this.greenhouseCropService.unassign(
      greenhouseId,
      cropId,
      resolveTenantId(currentUser, tenantId, false),
    );
  }
}

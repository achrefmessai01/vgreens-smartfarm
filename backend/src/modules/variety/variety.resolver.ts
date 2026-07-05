import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { User } from '@modules/users/entities/user.entity';
import { Variety } from './entities/variety.entity';
import { VarietyService } from './variety.service';
import { CreateVarietyInput, UpdateVarietyInput } from './dto';

// Global variety catalog. Reads are open to every authenticated user; writes
// (create / update / delete) are limited to admin roles so a regular tenant
// user can't rename or remove varieties another team member is using.
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Variety)
export class VarietyResolver {
  constructor(private readonly varietyService: VarietyService) {}

  @Query(() => [Variety], { name: 'varieties' })
  @Roles(
    UserRole.VGREENS_ADMIN,
    UserRole.VGREENS_MEMBER,
    UserRole.TENANT_ADMIN,
    UserRole.TENANT_USER,
  )
  async findByCrop(
    @Args('cropId', { type: () => ID }) cropId: string,
  ): Promise<Variety[]> {
    return this.varietyService.findByCrop(cropId);
  }

  // Adds a missing variety from the Batch Form's Variety dropdown. Admin-only.
  @Mutation(() => Variety)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createVariety(
    @Args('input') input: CreateVarietyInput,
  ): Promise<Variety> {
    return this.varietyService.createVariety(input);
  }

  @Mutation(() => Variety)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateVariety(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateVarietyInput,
  ): Promise<Variety> {
    return this.varietyService.updateVariety(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteVariety(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.varietyService.deleteVariety(id, currentUser.id);
    return true;
  }
}

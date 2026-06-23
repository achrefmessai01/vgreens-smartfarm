import { UserRole } from '@common/enums';
import { Roles } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { Variety } from './entities/variety.entity';
import { VarietyService } from './variety.service';
import { CreateVarietyInput } from './dto';

// Varieties are GLOBAL reference data shared by all tenants — reads are open to
// every authenticated user, and writes (createVariety) are limited to admins so
// the catalog stays curated.
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Variety)
export class VarietyResolver {
  constructor(private readonly varietyService: VarietyService) {}

  @Query(() => [Variety], { name: 'varieties' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findByCrop(
    @Args('cropId', { type: () => ID }) cropId: string,
  ): Promise<Variety[]> {
    return this.varietyService.findByCrop(cropId);
  }

  // Lets admins add a missing variety from the Batch Form's Variety dropdown.
  // Tied to the form's currently-selected crop via input.cropId.
  @Mutation(() => Variety)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createVariety(
    @Args('input') input: CreateVarietyInput,
  ): Promise<Variety> {
    return this.varietyService.createVariety(input);
  }
}

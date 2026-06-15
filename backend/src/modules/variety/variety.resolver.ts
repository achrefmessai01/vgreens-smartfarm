import { UserRole } from '@common/enums';
import { Roles } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { Variety } from './entities/variety.entity';
import { VarietyService } from './variety.service';

// Varieties are GLOBAL reference data shared by all tenants — no tenant filter
// and read-only (maintained by the vGreens Admin team outside this app).
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
}

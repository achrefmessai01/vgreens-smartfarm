import { UserRole } from '@common/enums';
import { Roles } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { Crop } from './entities/crop.entity';
import { CropService } from './crop.service';

// Crops are GLOBAL reference data shared by all tenants — no tenant filter and
// read-only (no create/update/delete; the vGreens Admin team maintains them
// outside this app).
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Crop)
export class CropResolver {
  constructor(private readonly cropService: CropService) {}

  @Query(() => [Crop], { name: 'crops' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @Args('greenhouseId', { type: () => ID, nullable: true })
    greenhouseId?: string | null,
  ): Promise<Crop[]> {
    return this.cropService.findAll(greenhouseId ?? undefined);
  }
}

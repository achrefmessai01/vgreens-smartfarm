import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { CurrentUser, Roles } from '@common/decorators';
import { UserRole } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { GetTenantParDliInput, TenantParDli } from './dto';
import { ParGraphService } from './par-graph.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver()
export class ParGraphResolver {
  constructor(private readonly parGraphService: ParGraphService) {}

  @Query(() => TenantParDli, { name: 'getParDliForTenant' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async getParDliForTenant(
    @CurrentUser() currentUser: User,
    @Args('input') input: GetTenantParDliInput,
  ): Promise<TenantParDli> {
    const targetTenantId = this.resolveTargetTenantId(
      currentUser,
      input.tenantId,
    );
    return this.parGraphService.getTenantParDli(targetTenantId, input.timezone);
  }

  /**
   * vGreens admins may target any tenant by passing `tenantId`; tenant
   * users always operate against their own tenant. Mirrors the pattern in
   * `SensorConfigResolver` so role-scoping behaves consistently across
   * tenant-aware resolvers.
   */
  private resolveTargetTenantId(
    currentUser: User,
    tenantId: string | undefined,
  ): string {
    const targetTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? (tenantId ?? currentUser.tenantId)
        : currentUser.tenantId;

    if (!targetTenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return targetTenantId;
  }
}

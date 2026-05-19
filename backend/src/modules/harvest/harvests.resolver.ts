import { UserRole } from '@common/enums';
import { Harvest } from './entities/harvest.entity';
import { HarvestsService } from './harvests.service';
import { Roles, CurrentUser } from '@common/decorators';
import {
  CreateHarvestInput,
  UpdateHarvestInput,
  HarvestFilterInput,
  DashboardFilterInput,
  HarvestDashboardMetrics,
  HarvestBatchListItem,
} from './dto';
import { User } from '@modules/users/entities/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { serializeHarvestsToCsv } from './utils/csv.util';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Harvest)
export class HarvestsResolver {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Query(() => [Harvest], { name: 'harvests' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => HarvestFilterInput, nullable: true })
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    if (currentUser.role !== UserRole.VGREENS_ADMIN && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.harvestsService.findAllFiltered(tenantId, filter);
  }

  @Query(() => Harvest, { name: 'harvest', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Harvest | null> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.harvestsService.findOneWithRelations(id, tenantId);
  }

  @Query(() => String, { name: 'harvestsCsvExport' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async harvestsCsvExport(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => HarvestFilterInput, nullable: true })
    filter?: HarvestFilterInput | null,
  ): Promise<string> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    if (currentUser.role !== UserRole.VGREENS_ADMIN && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    const harvests = await this.harvestsService.findAllFiltered(
      tenantId,
      filter ?? undefined,
    );
    return serializeHarvestsToCsv(harvests);
  }

  @Query(() => [HarvestBatchListItem], { name: 'harvestBatches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findBatches(
    @CurrentUser() currentUser: User,
  ): Promise<HarvestBatchListItem[]> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    if (currentUser.role !== UserRole.VGREENS_ADMIN && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.harvestsService.findBatchesForSelector(tenantId);
  }

  @Query(() => HarvestDashboardMetrics, { name: 'harvestDashboard' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async getDashboardMetrics(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => DashboardFilterInput, nullable: true })
    filter?: DashboardFilterInput | null,
  ): Promise<HarvestDashboardMetrics> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    if (currentUser.role !== UserRole.VGREENS_ADMIN && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.harvestsService.getDashboardMetrics(tenantId, filter);
  }

  @Mutation(() => Harvest)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createHarvest(
    @Args('input') input: CreateHarvestInput,
    @CurrentUser() currentUser: User,
  ): Promise<Harvest> {
    const tenantId = input.tenantId ?? currentUser.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!currentUser.id) {
      throw new Error('User ID is required');
    }

    return this.harvestsService.createHarvest(input, tenantId, currentUser.id);
  }

  @Mutation(() => Harvest)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async updateHarvest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateHarvestInput,
    @CurrentUser() currentUser: User,
  ): Promise<Harvest> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.harvestsService.updateHarvest(id, input, tenantId);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deleteHarvest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    await this.harvestsService.deleteHarvest(id, tenantId);
    return true;
  }
}

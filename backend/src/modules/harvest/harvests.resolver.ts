import { UserRole } from '@common/enums';
import { Harvest } from './entities/harvest.entity';
import { HarvestTotals } from './dto/harvest-totals.dto';
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
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import {
  serializeHarvestsToCsv,
  permittedColumnsForRole,
} from './utils/csv.util';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Harvest)
export class HarvestsResolver {
  constructor(private readonly harvestsService: HarvestsService) {}

  private resolveTenantId(currentUser: User, requireForNonAdmin = true): string | undefined {
    if (currentUser.role === UserRole.VGREENS_ADMIN) return undefined;
    if (requireForNonAdmin && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return currentUser.tenantId;
  }

  // Computed aggregate of the harvest's entries — replaces the omitted DB view.
  @ResolveField(() => HarvestTotals, { name: 'totals' })
  totals(@Parent() harvest: Harvest): HarvestTotals {
    return this.harvestsService.computeTotals(harvest.entries, harvest.batch);
  }

  @Query(() => [Harvest], { name: 'harvests' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => HarvestFilterInput, nullable: true })
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    return this.harvestsService.findAllFiltered(
      this.resolveTenantId(currentUser),
      filter,
    );
  }

  @Query(() => Harvest, { name: 'harvest', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Harvest | null> {
    return this.harvestsService.findOneWithRelations(
      id,
      this.resolveTenantId(currentUser, false),
    );
  }

  @Query(() => String, { name: 'harvestsCsvExport' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async harvestsCsvExport(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => HarvestFilterInput, nullable: true })
    filter?: HarvestFilterInput | null,
    @Args('columns', { type: () => [String], nullable: true })
    columns?: string[] | null,
  ): Promise<string> {
    const tenantId = this.resolveTenantId(currentUser);

    const permitted = permittedColumnsForRole(currentUser.role);
    const requested = columns && columns.length > 0 ? columns : permitted;
    const selected = permitted.filter((key) => requested.includes(key));

    const harvests = await this.harvestsService.findAllForExport(
      tenantId,
      filter ?? undefined,
    );
    return serializeHarvestsToCsv(harvests, selected);
  }

  @Query(() => [HarvestBatchListItem], { name: 'harvestBatches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findBatches(
    @CurrentUser() currentUser: User,
  ): Promise<HarvestBatchListItem[]> {
    return this.harvestsService.findBatchesForSelector(
      this.resolveTenantId(currentUser),
    );
  }

  @Query(() => HarvestDashboardMetrics, { name: 'harvestDashboard' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async getDashboardMetrics(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => DashboardFilterInput, nullable: true })
    filter?: DashboardFilterInput | null,
  ): Promise<HarvestDashboardMetrics> {
    return this.harvestsService.getDashboardMetrics(
      this.resolveTenantId(currentUser),
      filter,
    );
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
    return this.harvestsService.updateHarvest(
      id,
      input,
      this.resolveTenantId(currentUser, false),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deleteHarvest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.harvestsService.deleteHarvest(
      id,
      currentUser.id,
      this.resolveTenantId(currentUser, false),
    );
    return true;
  }
}

import { UserRole, InputMode } from '@common/enums';
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
  HarvestCrateAssignmentInput,
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
import { resolveTenantId } from '@common/utils';
import {
  serializeHarvestsToCsv,
  permittedColumnsForRole,
} from './utils/csv.util';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Harvest)
export class HarvestsResolver {
  constructor(private readonly harvestsService: HarvestsService) {}

  // Computed aggregate of the harvest's entries — replaces the omitted DB view.
  @ResolveField(() => HarvestTotals, { name: 'totals' })
  totals(@Parent() harvest: Harvest): HarvestTotals {
    // Crate-mode kg derive from the harvest's selected crate (falling back to
    // the legacy batch.crateWeight for harvests not yet repointed).
    const crateWeight =
      harvest.crate?.weight ?? harvest.batch?.crateWeight ?? null;
    return this.harvestsService.computeTotals(
      harvest.entries,
      harvest.batch,
      crateWeight,
    );
  }

  @Query(() => [Harvest], { name: 'harvests' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => HarvestFilterInput, nullable: true })
    filter?: HarvestFilterInput | null,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Harvest[]> {
    return this.harvestsService.findAllFiltered(
      resolveTenantId(currentUser, tenantId),
      filter,
    );
  }

  @Query(() => Harvest, { name: 'harvest', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Harvest | null> {
    return this.harvestsService.findOneWithRelations(
      id,
      resolveTenantId(currentUser, tenantId, false),
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
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<string> {
    const scopedTenantId = resolveTenantId(currentUser, tenantId);

    const permitted = permittedColumnsForRole(currentUser.role);
    const requested = columns && columns.length > 0 ? columns : permitted;
    const selected = permitted.filter((key) => requested.includes(key));

    const harvests = await this.harvestsService.findAllForExport(
      scopedTenantId,
      filter ?? undefined,
    );
    return serializeHarvestsToCsv(harvests, selected);
  }

  @Query(() => [HarvestBatchListItem], { name: 'harvestBatches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findBatches(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<HarvestBatchListItem[]> {
    return this.harvestsService.findBatchesForSelector(
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Query(() => HarvestDashboardMetrics, { name: 'harvestDashboard' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async getDashboardMetrics(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => DashboardFilterInput, nullable: true })
    filter?: DashboardFilterInput | null,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<HarvestDashboardMetrics> {
    return this.harvestsService.getDashboardMetrics(
      resolveTenantId(currentUser, tenantId),
      filter,
    );
  }

  @Mutation(() => Harvest)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createHarvest(
    @Args('input') input: CreateHarvestInput,
    @CurrentUser() currentUser: User,
  ): Promise<Harvest> {
    // For admins, input.tenantId is required and used directly. For non-admins
    // we ignore any supplied input.tenantId in favour of their own tenant.
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? input.tenantId
        : currentUser.tenantId;
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
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Harvest> {
    return this.harvestsService.updateHarvest(
      id,
      input,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  // Flip a whole batch between weight and crate mode, converting every harvest
  // entry's per-class arrays. Returns the batch's harvests with their converted
  // entries so the client cache updates in one round trip.
  @Mutation(() => [Harvest], { name: 'convertBatchInputMode' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async convertBatchInputMode(
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('targetMode', { type: () => InputMode }) targetMode: InputMode,
    @CurrentUser() currentUser: User,
    // Per-harvest crate choices for a weight -> crate switch; ignored the other
    // direction (each harvest keeps its own crate weight).
    @Args('crateAssignments', {
      type: () => [HarvestCrateAssignmentInput],
      nullable: true,
    })
    crateAssignments?: HarvestCrateAssignmentInput[] | null,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Harvest[]> {
    return this.harvestsService.convertBatchInputMode(
      batchId,
      targetMode,
      crateAssignments,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deleteHarvest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.harvestsService.deleteHarvest(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId, false),
    );
    return true;
  }
}

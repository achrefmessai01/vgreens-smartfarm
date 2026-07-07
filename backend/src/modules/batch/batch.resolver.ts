import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { resolveTenantId } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { Batch } from './entities/batch.entity';
import { BatchService } from './batch.service';
import {
  CreateBatchInput,
  UpdateBatchInput,
  BatchFilterInput,
  BatchSortInput,
} from './dto';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Batch)
export class BatchResolver {
  constructor(private readonly batchService: BatchService) {}

  @Query(() => [Batch], { name: 'batches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => BatchFilterInput, nullable: true })
    filter?: BatchFilterInput | null,
    @Args('sort', { type: () => BatchSortInput, nullable: true })
    sort?: BatchSortInput | null,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch[]> {
    return this.batchService.findAllScoped(
      resolveTenantId(currentUser, tenantId),
      filter,
      sort,
    );
  }

  @Query(() => Batch, { name: 'batch', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch | null> {
    return this.batchService.findOneById(
      id,
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Mutation(() => Batch)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createBatch(
    @Args('input') input: CreateBatchInput,
    @CurrentUser() currentUser: User,
  ): Promise<Batch> {
    // Admins must pass `input.tenantId` explicitly. Non-admins are pinned to
    // their own tenant regardless of the value supplied.
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
    return this.batchService.createBatch(input, tenantId, currentUser.id);
  }

  @Mutation(() => Batch)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async updateBatch(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBatchInput,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch> {
    return this.batchService.updateBatch(
      id,
      input,
      resolveTenantId(currentUser, tenantId),
    );
  }

  // Persist a manual drag-and-drop order for the tenant's batches. `ids` is the
  // full batch list in its new order; each id's position becomes its sortOrder.
  // Returns the batches in the saved order so the client cache updates directly.
  @Mutation(() => [Batch], { name: 'reorderBatches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async reorderBatches(
    @Args('ids', { type: () => [ID] }) ids: string[],
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch[]> {
    return this.batchService.reorderBatches(
      ids,
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deleteBatch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.batchService.deleteBatch(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId),
    );
    return true;
  }

  @Query(() => [Batch], { name: 'deletedBatches' })
  @Roles(UserRole.VGREENS_ADMIN)
  async deletedBatches(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch[]> {
    return this.batchService.findDeletedBatches(
      resolveTenantId(currentUser, tenantId),
    );
  }

  @Mutation(() => Batch, { name: 'restoreBatch' })
  @Roles(UserRole.VGREENS_ADMIN)
  async restoreBatch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Batch> {
    return this.batchService.restoreBatch(
      id,
      resolveTenantId(currentUser, tenantId),
    );
  }

}

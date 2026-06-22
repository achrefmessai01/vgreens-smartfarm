import { UserRole } from '@common/enums';
import { Roles, CurrentUser } from '@common/decorators';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
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

  private resolveTenantId(currentUser: User): string | undefined {
    if (currentUser.role === UserRole.VGREENS_ADMIN) return undefined;
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return currentUser.tenantId;
  }

  @Query(() => [Batch], { name: 'batches' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => BatchFilterInput, nullable: true })
    filter?: BatchFilterInput | null,
    @Args('sort', { type: () => BatchSortInput, nullable: true })
    sort?: BatchSortInput | null,
  ): Promise<Batch[]> {
    return this.batchService.findAllScoped(
      this.resolveTenantId(currentUser),
      filter,
      sort,
    );
  }

  @Query(() => Batch, { name: 'batch', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Batch | null> {
    return this.batchService.findOneById(id, this.resolveTenantId(currentUser));
  }

  @Mutation(() => Batch)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createBatch(
    @Args('input') input: CreateBatchInput,
    @CurrentUser() currentUser: User,
  ): Promise<Batch> {
    const tenantId = input.tenantId ?? currentUser.tenantId;
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
  ): Promise<Batch> {
    return this.batchService.updateBatch(
      id,
      input,
      this.resolveTenantId(currentUser),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async deleteBatch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.batchService.deleteBatch(
      id,
      currentUser.id,
      this.resolveTenantId(currentUser),
    );
    return true;
  }
}

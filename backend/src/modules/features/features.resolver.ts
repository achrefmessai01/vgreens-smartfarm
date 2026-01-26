import { Feature } from './entities/feature.entity';
import { FeaturesService } from './features.service';
import { TenantFeature } from './entities/tenant-feature.entity';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import {
  CreateFeatureInput,
  UpdateFeatureInput,
  ToggleTenantFeatureInput,
  FeatureWithTenantStatus,
} from './dto';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { User } from '@modules/users/entities/user.entity';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver(() => Feature)
export class FeaturesResolver {
  constructor(private readonly featuresService: FeaturesService) {}

  @Query(() => [Feature], { name: 'features' })
  @Roles(UserRole.VGREENS_ADMIN)
  findAll(): Promise<Feature[]> {
    return this.featuresService.findAll();
  }

  @Query(() => [FeatureWithTenantStatus], { name: 'featuresWithTenantStatus' })
  @Roles(UserRole.VGREENS_ADMIN)
  findAllWithTenantStatus(
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
  ): Promise<FeatureWithTenantStatus[]> {
    return this.featuresService.getAllFeaturesWithTenantStatus(tenantId);
  }

  @Query(() => Feature, { name: 'feature', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN)
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Feature | null> {
    return this.featuresService.findOne(id);
  }

  @Query(() => [TenantFeature], { name: 'tenantFeatures' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  getTenantFeatures(
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<TenantFeature[]> {
    let targetTenantId = tenantId;

    if (!targetTenantId || currentUser?.role !== UserRole.VGREENS_ADMIN) {
      targetTenantId = currentUser?.tenantId;
    }

    if (!targetTenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.featuresService.getTenantFeatures(targetTenantId);
  }

  @Mutation(() => Feature)
  @Roles(UserRole.VGREENS_ADMIN)
  createFeature(
    @Args('input') createFeatureInput: CreateFeatureInput,
  ): Promise<Feature> {
    return this.featuresService.createFeature(createFeatureInput);
  }

  @Mutation(() => Feature)
  @Roles(UserRole.VGREENS_ADMIN)
  updateFeature(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateFeatureInput: UpdateFeatureInput,
  ): Promise<Feature> {
    return this.featuresService.updateFeature(id, updateFeatureInput);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN)
  deleteFeature(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.featuresService.deleteFeature(id);
  }

  @Mutation(() => TenantFeature)
  @Roles(UserRole.VGREENS_ADMIN)
  toggleTenantFeature(
    @Args('input') input: ToggleTenantFeatureInput,
  ): Promise<TenantFeature> {
    return this.featuresService.toggleTenantFeature(input);
  }
}

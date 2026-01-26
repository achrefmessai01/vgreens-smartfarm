import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { TenantFeature } from './entities/tenant-feature.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { BaseService } from '@common/services';
import {
  CreateFeatureInput,
  UpdateFeatureInput,
  ToggleTenantFeatureInput,
} from './dto';

@Injectable()
export class FeaturesService extends BaseService<Feature> {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(TenantFeature)
    private readonly tenantFeatureRepository: Repository<TenantFeature>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {
    super(featureRepository);
  }

  async createFeature(
    createFeatureInput: CreateFeatureInput,
  ): Promise<Feature> {
    // Check if feature with this key already exists
    const existing = await this.featureRepository.findOne({
      where: { key: createFeatureInput.key },
    });
    if (existing) {
      throw new ForbiddenException(
        `Feature with key "${createFeatureInput.key}" already exists`,
      );
    }

    const feature = this.featureRepository.create({
      ...createFeatureInput,
      isActive: createFeatureInput.isActive ?? true,
    });

    return this.featureRepository.save(feature);
  }

  async updateFeature(
    id: string,
    updateFeatureInput: UpdateFeatureInput,
  ): Promise<Feature> {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }

    // If updating key, check for duplicates
    if (updateFeatureInput.key && updateFeatureInput.key !== feature.key) {
      const existing = await this.featureRepository.findOne({
        where: { key: updateFeatureInput.key },
      });
      if (existing) {
        throw new ForbiddenException(
          `Feature with key "${updateFeatureInput.key}" already exists`,
        );
      }
    }

    Object.assign(feature, updateFeatureInput);
    return this.featureRepository.save(feature);
  }

  async deleteFeature(id: string): Promise<boolean> {
    // Check if any tenants are using this feature
    const tenantFeatures = await this.tenantFeatureRepository.find({
      where: { featureId: id },
    });

    if (tenantFeatures.length > 0) {
      throw new ForbiddenException(
        `Cannot delete feature. It is enabled for ${tenantFeatures.length} tenant(s). Disable it for all tenants first.`,
      );
    }

    const result = await this.featureRepository.delete(id);
    return result.affected > 0;
  }

  async getTenantFeatures(tenantId: string): Promise<TenantFeature[]> {
    return this.tenantFeatureRepository.find({
      where: { tenantId },
      relations: ['feature'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleTenantFeature(
    input: ToggleTenantFeatureInput,
  ): Promise<TenantFeature> {
    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { id: input.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID "${input.tenantId}" not found`,
      );
    }

    // Verify feature exists
    const feature = await this.featureRepository.findOne({
      where: { id: input.featureId },
    });
    if (!feature) {
      throw new NotFoundException(
        `Feature with ID "${input.featureId}" not found`,
      );
    }

    // Find or create tenant feature
    let tenantFeature = await this.tenantFeatureRepository.findOne({
      where: {
        tenantId: input.tenantId,
        featureId: input.featureId,
      },
      relations: ['feature'],
    });

    if (tenantFeature) {
      tenantFeature.enabled = input.enabled;
      if (input.config !== undefined) {
        tenantFeature.config = input.config;
      }
    } else {
      tenantFeature = this.tenantFeatureRepository.create({
        tenantId: input.tenantId,
        featureId: input.featureId,
        enabled: input.enabled,
        config: input.config,
        feature: feature,
      });
    }

    const saved = await this.tenantFeatureRepository.save(tenantFeature);

    // Reload with relations to ensure feature is populated
    const result = await this.tenantFeatureRepository.findOne({
      where: { id: saved.id },
      relations: ['feature'],
    });

    if (!result) {
      throw new NotFoundException('Failed to reload tenant feature');
    }

    return result;
  }

  async getFeatureAccess(
    tenantId: string,
    featureKey: string,
  ): Promise<boolean> {
    const tenantFeature = await this.tenantFeatureRepository.findOne({
      where: {
        tenantId,
        feature: { key: featureKey },
      },
      relations: ['feature'],
    });

    if (!tenantFeature) {
      return false;
    }

    // Feature must be active and enabled for tenant
    return tenantFeature.feature.isActive && tenantFeature.enabled;
  }

  async getAllFeaturesWithTenantStatus(
    tenantId?: string,
  ): Promise<Array<Feature & { enabledForTenant?: boolean }>> {
    const features = await this.featureRepository.find({
      order: { category: 'ASC', name: 'ASC' },
    });

    if (!tenantId) {
      return features.map((f) => ({ ...f, enabledForTenant: false }));
    }

    const tenantFeatures = await this.tenantFeatureRepository.find({
      where: { tenantId },
      relations: ['feature'],
    });

    const enabledFeatureIds = new Set(
      tenantFeatures.filter((tf) => tf.enabled).map((tf) => tf.featureId),
    );

    return features.map((feature) => ({
      ...feature,
      enabledForTenant: enabledFeatureIds.has(feature.id),
    }));
  }
}

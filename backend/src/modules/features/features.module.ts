import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { FeaturesService } from './features.service';
import { FeaturesResolver } from './features.resolver';
import { TenantFeature } from './entities/tenant-feature.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature, TenantFeature, Tenant])],
  providers: [FeaturesService, FeaturesResolver],
  exports: [TypeOrmModule, FeaturesService],
})
export class FeaturesModule {}

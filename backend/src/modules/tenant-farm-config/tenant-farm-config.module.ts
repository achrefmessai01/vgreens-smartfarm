import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantFarmConfig } from './entities/tenant-farm-config.entity';
import { TenantFarmConfigService } from './tenant-farm-config.service';
import { TenantFarmConfigResolver } from './tenant-farm-config.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([TenantFarmConfig])],
  providers: [TenantFarmConfigResolver, TenantFarmConfigService],
  exports: [TenantFarmConfigService],
})
export class TenantFarmConfigModule {}

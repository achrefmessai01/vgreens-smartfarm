import { Harvest } from './entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarvestsService } from './harvests.service';
import { HarvestsResolver } from './harvests.resolver';
import { TenantsModule } from '@modules/tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest]), TenantsModule],
  providers: [HarvestsResolver, HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule {}

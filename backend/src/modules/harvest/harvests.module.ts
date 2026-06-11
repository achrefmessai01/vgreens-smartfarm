import { Harvest, HarvestEntry } from './entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarvestsService } from './harvests.service';
import { HarvestsResolver } from './harvests.resolver';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { BatchModule } from '@modules/batch/batch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Harvest, HarvestEntry]),
    TenantsModule,
    BatchModule,
  ],
  providers: [HarvestsResolver, HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule {}

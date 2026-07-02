import { Harvest, HarvestEntry } from './entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarvestsService } from './harvests.service';
import { HarvestsResolver } from './harvests.resolver';
import { HarvestImportService } from './harvest-import.service';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { BatchModule } from '@modules/batch/batch.module';
import { CrateModule } from '@modules/crate/crate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Harvest, HarvestEntry]),
    TenantsModule,
    BatchModule,
    CrateModule,
  ],
  providers: [HarvestsResolver, HarvestsService, HarvestImportService],
  exports: [HarvestsService],
})
export class HarvestsModule {}

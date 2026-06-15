import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Variety } from '@modules/variety/entities/variety.entity';
import { GreenhouseCrop } from '@modules/greenhouse-crop/entities/greenhouse-crop.entity';
import { Batch } from './entities';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';

@Module({
  imports: [
    // Batch validation/name-derivation reads the crops/varieties catalog and the
    // greenhouse_crops join, so register their repositories here.
    TypeOrmModule.forFeature([Batch, Crop, Variety, GreenhouseCrop]),
    TenantsModule,
  ],
  providers: [BatchResolver, BatchService],
  exports: [BatchService],
})
export class BatchModule {}

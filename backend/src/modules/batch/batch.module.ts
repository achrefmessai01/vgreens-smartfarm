import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { Batch } from './entities';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Batch]), TenantsModule],
  providers: [BatchResolver, BatchService],
  exports: [BatchService],
})
export class BatchModule {}

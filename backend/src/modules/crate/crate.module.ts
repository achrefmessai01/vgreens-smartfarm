import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crate } from './entities/crate.entity';
import { CrateService } from './crate.service';
import { CrateResolver } from './crate.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Crate])],
  providers: [CrateResolver, CrateService],
  exports: [CrateService, TypeOrmModule],
})
export class CrateModule {}

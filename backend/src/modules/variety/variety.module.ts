import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variety } from './entities';
import { VarietyService } from './variety.service';
import { VarietyResolver } from './variety.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Variety])],
  providers: [VarietyResolver, VarietyService],
  exports: [VarietyService, TypeOrmModule],
})
export class VarietyModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrrigationCycle } from './entities/irrigation-cycle.entity';

/**
 * Registers the `irrigation_cycles` entity so its repository is available for
 * injection. No resolver/service yet — the table is recreated ahead of the
 * feature that will consume it; wire those up when that work lands.
 */
@Module({
  imports: [TypeOrmModule.forFeature([IrrigationCycle])],
  exports: [TypeOrmModule],
})
export class IrrigationCyclesModule {}

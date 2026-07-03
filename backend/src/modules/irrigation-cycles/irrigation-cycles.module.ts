import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhouseModule } from '@modules/greenhouse/greenhouse.module';
import { SensorConfig } from '@modules/sensor-config/entities/sensor-config.entity';
import { IrrigationCycle } from './entities/irrigation-cycle.entity';
import { IrrigationCyclesResolver } from './irrigation-cycles.resolver';
import { IrrigationCyclesService } from './irrigation-cycles.service';

// The SensorConfig repository is registered here too: assigning a sensor to a
// cycle writes sensor_configs.irrigationCycleId, and the cycle's `sensors`
// field reads it back.
@Module({
  imports: [
    TypeOrmModule.forFeature([IrrigationCycle, SensorConfig]),
    GreenhouseModule,
  ],
  providers: [IrrigationCyclesResolver, IrrigationCyclesService],
  exports: [TypeOrmModule],
})
export class IrrigationCyclesModule {}

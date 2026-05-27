import { Module } from '@nestjs/common';
import { InfluxDBModule } from '@modules/influxdb/influxdb.module';
import { SensorConfigModule } from '@modules/sensor-config/sensor-config.module';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { GreenhouseSensorMappingService } from './greenhouse-sensor-mapping.service';
import { ParGraphResolver } from './par-graph.resolver';
import { ParGraphService } from './par-graph.service';

@Module({
  imports: [TenantsModule, SensorConfigModule, InfluxDBModule],
  providers: [
    ParGraphResolver,
    ParGraphService,
    GreenhouseSensorMappingService,
  ],
  exports: [ParGraphService, GreenhouseSensorMappingService],
})
export class ParGraphModule {}

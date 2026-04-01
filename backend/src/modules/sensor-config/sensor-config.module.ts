import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorConfig } from './entities/sensor-config.entity';
import { SensorConfigService } from './sensor-config.service';
import { SensorConfigResolver } from './sensor-config.resolver';
import { InfluxDBModule } from '@modules/influxdb/influxdb.module';
import { TenantsModule } from '@modules/tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorConfig]),
    InfluxDBModule,
    TenantsModule,
  ],
  providers: [SensorConfigResolver, SensorConfigService],
  exports: [SensorConfigService],
})
export class SensorConfigModule {}

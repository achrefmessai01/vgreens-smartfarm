import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { InfluxDBService } from './influxdb.service';
import { InfluxDBResolver } from './influxdb.resolver';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [InfluxDBService, InfluxDBResolver],
  exports: [InfluxDBService],
})
export class InfluxDBModule {}

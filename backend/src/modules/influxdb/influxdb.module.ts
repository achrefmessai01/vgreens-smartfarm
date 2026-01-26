import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { InfluxDBService } from './influxdb.service';
import { InfluxDBResolver } from './influxdb.resolver';
import { InfluxTenantService } from './influx-tenant.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [InfluxDBService, InfluxDBResolver, InfluxTenantService],
  exports: [InfluxDBService, InfluxTenantService],
})
export class InfluxDBModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities';
import { AlertsService } from './alerts.service';
import { AlertsResolver } from './alerts.resolver';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { AlertThresholdService } from './alert-threshold.service';
import { InfluxDBModule } from '@modules/influxdb/influxdb.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), InfluxDBModule, TenantsModule],
  providers: [AlertsResolver, AlertsService, AlertThresholdService],
  exports: [AlertsService],
})
export class AlertsModule {}

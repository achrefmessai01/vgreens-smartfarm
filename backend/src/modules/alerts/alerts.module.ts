import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities';
import { AlertsService } from './alerts.service';
import { AlertsResolver } from './alerts.resolver';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { AlertThresholdService } from './alert-threshold.service';
import { InfluxDBModule } from '@modules/influxdb/influxdb.module';
import { pubSubProvider } from './pubsub';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), InfluxDBModule, TenantsModule],
  providers: [
    AlertsResolver,
    AlertsService,
    AlertThresholdService,
    pubSubProvider,
  ],
  exports: [AlertsService],
})
export class AlertsModule {}

import { Module } from '@nestjs/common';
import { Alert } from './entities/alert.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsResolver } from './alerts.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertsResolver, AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

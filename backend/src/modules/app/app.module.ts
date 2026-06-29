import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { UsersModule } from '@modules/users';
import { FilesModule } from '@modules/files';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateTimeScalar } from '@common/scalar';
import { ScheduleModule } from '@nestjs/schedule';
import { graphqlConfig } from '@config/graphql.config';
import { typeOrmConfig } from '@config/typeorm.config';
import { AlertsModule } from '../alerts/alerts.module';
import { GraphQLExceptionFilter } from '@common/filters';
import { TenantsModule } from '../tenants/tenants.module';
import { AuthGuard, ClerkAuthGuard } from '@common/guards';
import { HarvestsModule } from '../harvest/harvests.module';
import { BatchModule } from '../batch/batch.module';
import { CrateModule } from '../crate/crate.module';
import { CropModule } from '../crop/crop.module';
import { VarietyModule } from '../variety/variety.module';
import { GreenhouseModule } from '../greenhouse/greenhouse.module';
import { GreenhouseCropModule } from '../greenhouse-crop/greenhouse-crop.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeaturesModule } from '../features/features.module';
import { InfluxDBModule } from '../influxdb/influxdb.module';
import { ErrorReportsModule } from '../error-reports/error-reports.module';
import { SystemErrorsModule } from '../system-errors/system-errors.module';
import { SensorConfigModule } from '../sensor-config/sensor-config.module';
import { TenantFarmConfigModule } from '../tenant-farm-config/tenant-farm-config.module';
import { ParGraphModule } from '../par-graph/par-graph.module';
import { CameraLivestreamModule } from '../camera-livestream/camera-livestream.module';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  TenantInterceptor,
  UserInterceptor,
  ErrorLoggingInterceptor,
} from '@common/interceptors';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    GraphQLModule.forRoot(graphqlConfig),
    TenantsModule,
    UsersModule,
    FeaturesModule,
    AlertsModule,
    GreenhouseModule,
    CropModule,
    VarietyModule,
    GreenhouseCropModule,
    BatchModule,
    CrateModule,
    HarvestsModule,
    InfluxDBModule,
    FilesModule,
    ErrorReportsModule,
    SystemErrorsModule,
    SensorConfigModule,
    TenantFarmConfigModule,
    ParGraphModule,
    CameraLivestreamModule,
  ],
  providers: [
    AppResolver,
    DateTimeScalar,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { UsersModule } from '@modules/users';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeaturesModule } from '../features/features.module';
import { InfluxDBModule } from '../influxdb/influxdb.module';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor, UserInterceptor } from '@common/interceptors';

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
    HarvestsModule,
    InfluxDBModule,
  ],
  providers: [
    AppResolver,
    DateTimeScalar,
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

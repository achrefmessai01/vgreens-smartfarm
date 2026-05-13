import { UseGuards } from '@nestjs/common';
import { Public } from '@/common/decorators';
import { InfluxDBService } from './influxdb.service';
import { InfluxDBData } from './dto/influxdb-data.object';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { GetBucketDataInput } from './dto/get-bucket-data.dto';
import {
  FieldMeanMetric,
  GetFieldMeansInput,
  GetParDliTodayInput,
  ParDliPoint,
} from './dto';
import { Resolver, Query, Args } from '@nestjs/graphql';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver()
export class InfluxDBResolver {
  constructor(private readonly influxDBService: InfluxDBService) {}

  @Query(() => String, { name: 'testInfluxDBConnection' })
  //   @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async testConnection(): Promise<string> {
    const result = await this.influxDBService.testConnection();
    return result.success
      ? result.message
      : `Connection failed: ${result.message}`;
  }

  @Query(() => [String])
  async getBuckets(): Promise<string[]> {
    return this.influxDBService.getBuckets();
  }

  @Query(() => [InfluxDBData], { name: 'getBucketData' })
  async getBucketData(
    @Args('input') input: GetBucketDataInput,
  ): Promise<InfluxDBData[]> {
    const {
      bucketName,
      start,
      stop,
      limit,
      field,
      greenhouse,
      device,
      level,
      useLastPerSeries,
    } = input;
    const rows = useLastPerSeries
      ? await this.influxDBService.getBucketDataLastPerSeries(bucketName, {
          start: start ?? '-1h',
          stop,
          field,
          greenhouse,
          device,
          level,
        })
      : await this.influxDBService.getBucketData(bucketName, {
          start: start ?? '-1h',
          stop,
          limit: limit ?? 100,
          field,
          greenhouse,
          device,
          level,
        });
    return rows.map((data) => ({ data }));
  }

  @Public()
  @Query(() => [FieldMeanMetric], { name: 'getBucketFieldMeansLastMinutes' })
  async getBucketFieldMeansLastMinutes(
    @Args('input') input: GetFieldMeansInput,
  ): Promise<FieldMeanMetric[]> {
    const { bucketName, windowMinutes, greenhouse, start, stop } = input;
    return this.influxDBService.getBucketFieldMeansLastMinutes(bucketName, {
      greenhouse,
      windowMinutes,
      start,
      stop,
    });
  }

  @Public()
  @Query(() => [ParDliPoint], { name: 'getParDliToday' })
  async getParDliToday(
    @Args('input') input: GetParDliTodayInput,
  ): Promise<ParDliPoint[]> {
    const { bucketName, greenhouse } = input;
    return this.influxDBService.getTodayParCumulativeDli(bucketName, {
      greenhouse,
    });
  }

  @Query(() => [String], { name: 'getBucketFields' })
  async getBucketFields(
    @Args('bucketName', { type: () => String }) bucketName: string,
    @Args('start', { type: () => String, nullable: true })
    start?: string,
    @Args('stop', { type: () => String, nullable: true })
    stop?: string,
  ): Promise<string[]> {
    return this.influxDBService.getBucketFields(bucketName, {
      start: start ?? '-1h',
      stop,
    });
  }
}

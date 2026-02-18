import { UseGuards } from '@nestjs/common';
import { Public } from '@/common/decorators';
import { InfluxDBService } from './influxdb.service';
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { InfluxDBData } from './dto/influxdb-data.object';

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

  /**
   * Query data from an InfluxDB bucket by name (e.g. tenant's influxBucketName).
   * For testing in GraphQL playground.
   */
  @Query(() => [InfluxDBData], { name: 'getBucketData' })
  async getBucketData(
    @Args('bucketName', { type: () => String }) bucketName: string,
    @Args('start', { type: () => String, nullable: true })
    start?: string,
    @Args('stop', { type: () => String, nullable: true })
    stop?: string,
    @Args('limit', { type: () => Int, nullable: true })
    limit?: number,
    @Args('field', { type: () => String, nullable: true })
    field?: string,
    @Args('greenhouse', { type: () => String, nullable: true })
    greenhouse?: string,
    @Args('device', { type: () => String, nullable: true })
    device?: string,
    @Args('level', { type: () => String, nullable: true })
    level?: string,
  ): Promise<InfluxDBData[]> {
    const rows = await this.influxDBService.getBucketData(bucketName, {
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

  /**
   * Returns all unique _field values from a bucket (e.g. "humidity", "co2", "temperature").
   */
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

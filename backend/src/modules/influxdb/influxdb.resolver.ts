import { UseGuards } from '@nestjs/common';
import { Public } from '@common/decorators';
import { Resolver, Query } from '@nestjs/graphql';
import { InfluxDBService } from './influxdb.service';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Resolver()
export class InfluxDBResolver {
  constructor(private readonly influxDBService: InfluxDBService) {}

  @Query(() => String, { name: 'testInfluxDBConnection' })
  //   @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  @Public()
  async testConnection(): Promise<string> {
    const result = await this.influxDBService.testConnection();
    return result.success
      ? result.message
      : `Connection failed: ${result.message}`;
  }

  @Query(() => [String])
  @Public()
  async getBuckets(): Promise<string[]> {
    return this.influxDBService.getBuckets();
  }
}

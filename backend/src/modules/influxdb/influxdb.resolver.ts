import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { CurrentUser, Public } from '@common/decorators';
import { User } from '@modules/users/entities/user.entity';
import { InfluxDBService } from './influxdb.service';
import { WriteDataInput, QueryDataInput, InfluxDBData } from './dto';

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

  @Mutation(() => Boolean, { name: 'writeInfluxDBData' })
  @Public()
  //   @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async writeData(
    @Args('input') input: WriteDataInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    const tenantId = input.tenantId || currentUser.tenantId || '';
    return this.influxDBService.writeData(input, tenantId);
  }

  @Query(() => [InfluxDBData], { name: 'queryInfluxDBData' })
  @Public()
  //   @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async queryData(
    @Args('input') input: QueryDataInput,
    @CurrentUser() currentUser: User,
  ): Promise<InfluxDBData[]> {
    const tenantId = input.tenantId || currentUser.tenantId || '';
    const results = await this.influxDBService.queryData(input, tenantId);
    return results.map((row) => ({ data: row }));
  }
}

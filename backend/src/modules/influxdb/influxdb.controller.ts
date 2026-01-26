import { Controller, Get } from '@nestjs/common';
import { InfluxDBService } from './influxdb.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('influxdb')
export class InfluxDBController {
  constructor(private readonly influxDBService: InfluxDBService) {}

  @Public()
  @Get('test')
  async testConnection() {
    const result = await this.influxDBService.testConnection();
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
}

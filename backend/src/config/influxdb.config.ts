import { ConfigService } from '@nestjs/config';
import { InfluxDBClient } from '@influxdata/influxdb3-client';

export const influxdbConfig = (configService: ConfigService) => {
  const host = configService.get<string>('INFLUXDB_URL');
  const token = configService.get<string>('INFLUXDB_TOKEN');
  const database =
    configService.get<string>('INFLUXDB_DATABASE') ||
    configService.get<string>('INFLUXDB_BUCKET');

  if (!host || !token || !database) {
    return {
      host,
      token,
      database,
      client: null,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const client = new InfluxDBClient({
      host,
      token,
      database,
    });

    return {
      host,
      token,
      database,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      client,
    };
  } catch {
    return {
      host,
      token,
      database,
      client: null,
    };
  }
};

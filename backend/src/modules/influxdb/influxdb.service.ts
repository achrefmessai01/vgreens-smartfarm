/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';

@Injectable()
export class InfluxDBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfluxDBService.name);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private client = null;
  private readonly host: string;
  private readonly token: string;
  private readonly database: string;

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.get<string>('INFLUXDB_URL') || '';
    this.token = this.configService.get<string>('INFLUXDB_TOKEN') || '';
    this.database = this.configService.get<string>('INFLUXDB_DATABASE') || '';
  }

  onModuleInit() {
    this.initializeClient();
  }

  onModuleDestroy() {
    void this.close();
  }

  private initializeClient(): void {
    const missingConfig: string[] = [];
    if (!this.host) missingConfig.push('INFLUXDB_URL');
    if (!this.token) missingConfig.push('INFLUXDB_TOKEN');
    if (!this.database) missingConfig.push('INFLUXDB_DATABASE');

    if (missingConfig.length > 0) {
      this.logger.warn(
        `InfluxDB configuration is incomplete. Missing: ${missingConfig.join(', ')}. Some features may not work.`,
      );
      return;
    }

    try {
      this.client = new InfluxDBClient({
        host: this.host,
        token: this.token,
        database: this.database,
      });

      this.logger.log('InfluxDB client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize InfluxDB client', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      const missingConfig: string[] = [];
      if (!this.host) missingConfig.push('INFLUXDB_URL');
      if (!this.token) missingConfig.push('INFLUXDB_TOKEN');
      if (!this.database) missingConfig.push('INFLUXDB_DATABASE');

      const message =
        missingConfig.length > 0
          ? `InfluxDB client not initialized. Missing configuration: ${missingConfig.join(', ')}`
          : 'InfluxDB client is not initialized';

      this.logger.error(message);
      return { success: false, message };
    }

    try {
      // Simple SQL query to test connection
      // This query will work even if the database is empty
      const query = `SELECT 1 as test`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const queryResult = await this.client.query(query);
      let hasResult = false;

      for await (const row of queryResult) {
        hasResult = true;
        this.logger.debug('Test query result:', row);
        break; // Just check if we can get a result
      }

      if (hasResult) {
        this.logger.log('InfluxDB connection test successful');
        return {
          success: true,
          message: 'InfluxDB connection successful',
        };
      } else {
        this.logger.log(
          'InfluxDB connection test successful (no data returned, but connection works)',
        );
        return {
          success: true,
          message: 'InfluxDB connection successful',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check for specific error types
      if (errorMessage.includes('404') || errorMessage.includes('Not found')) {
        this.logger.error(
          `InfluxDB database not found. Database: "${this.database}"`,
        );
        return {
          success: false,
          message: `InfluxDB database "${this.database}" not found. Please verify it exists in your InfluxDB instance.`,
        };
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        this.logger.error(
          'InfluxDB authentication failed. Please check your token.',
        );
        return {
          success: false,
          message:
            'InfluxDB authentication failed. Please verify your INFLUXDB_TOKEN is correct.',
        };
      } else {
        this.logger.error('InfluxDB connection test failed:', error);
        return {
          success: false,
          message: `InfluxDB connection failed: ${errorMessage}`,
        };
      }
    }
  }

  close(): void {
    if (this.client) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.client.close();
      this.logger.log('InfluxDB client closed');
    }
  }

  async writeData(
    input: {
      measurement: string;
      tenantId?: string;
      tunnelId?: string;
      sensorName?: string;
      value?: number;
      unit?: string;
      sensorType?: string;
    },
    tenantId: string,
  ): Promise<boolean> {
    if (!this.client) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    try {
      // Use InfluxDB 3.x Point API for writing data (official method)
      // eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const point: Point = Point.measurement('testing');

      // Add tags and fields - Point API methods
      if (tenantId) {
        point.setTag('tenant_id', tenantId);
      }
      if (input.tunnelId) {
        point.setTag('tunnel_id', input.tunnelId);
      }
      if (input.sensorName) {
        point.setTag('sensor_name', input.sensorName);
      }
      if (input.sensorType) {
        point.setTag('sensor_type', input.sensorType);
      }

      // Add fields
      if (input.value !== undefined) {
        point.setFloatField('value', input.value);
      }
      if (input.unit) {
        point.setStringField('unit', input.unit);
      }

      // Set timestamp (current time in seconds)
      point.setTimestamp(Math.floor(Date.now() / 1000));
      // eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment

      this.logger.debug(`Writing point to InfluxDB`);

      // Write point to InfluxDB using the client write method
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.client.write([point], this.database, '', { precision: 's' });

      this.logger.debug('Write completed successfully');

      this.logger.log(
        `Successfully wrote data to testing table for tenant ${tenantId}`,
      );

      // Verify the write by querying immediately after
      const verifyQuery = `SELECT * FROM testing WHERE tenant_id = '${tenantId}' ORDER BY time DESC LIMIT 1`;
      this.logger.debug(`Verifying write with query: ${verifyQuery}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const verifyResult = await this.client.query(verifyQuery);
      let found = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for await (const row of verifyResult) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rowData = row as Record<string, unknown>;
        this.logger.debug(`Verification found row: ${JSON.stringify(rowData)}`);
        if (rowData.tenant_id === tenantId) {
          found = true;
          break;
        }
      }

      if (!found) {
        this.logger.warn(
          `Write executed but data not found in table. This might indicate a schema mismatch or data type conflict.`,
        );
      } else {
        this.logger.log(`Write verification: PASSED`);
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to write data to InfluxDB:', error);
      throw new Error(`Failed to write data: ${errorMessage}`);
    }
  }

  async queryData(
    input: {
      measurement: string;
      tenantId?: string;
      tunnelId?: string;
      sensorName?: string;
      startTime?: string;
      endTime?: string;
      limit?: string;
    },
    tenantId: string,
  ): Promise<Record<string, unknown>[]> {
    if (!this.client) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    try {
      // Simple SQL SELECT query for testing table
      let query = `SELECT * FROM testing WHERE tenant_id = '${tenantId}'`;

      // Add optional filters (only if provided)
      // Commented out for testing - return all data
      // if (input.tunnelId && input.tunnelId.trim() !== '') {
      //   query += ` AND tunnel_id = '${input.tunnelId}'`;
      // }
      // if (input.sensorName && input.sensorName.trim() !== '') {
      //   query += ` AND sensor_name = '${input.sensorName}'`;
      // }
      // if (input.startTime) {
      //   query += ` AND time >= '${input.startTime}'`;
      // }
      // if (input.endTime) {
      //   query += ` AND time <= '${input.endTime}'`;
      // }

      query += ' ORDER BY time DESC';
      query += ` LIMIT ${input.limit || '100'}`;

      this.logger.debug(`Executing InfluxDB query: ${query}`);
      this.logger.debug(
        `Query filters - tenantId: ${tenantId}, tunnelId: ${input.tunnelId}, sensorName: ${input.sensorName}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const queryResult = await this.client.query(query);
      const results: Record<string, unknown>[] = [];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for await (const row of queryResult) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        results.push(row as Record<string, unknown>);
        this.logger.debug(`Row data: ${JSON.stringify(row)}`);
      }

      this.logger.log(
        `Successfully queried ${results.length} rows from testing table for tenant ${tenantId}`,
      );

      if (results.length === 0) {
        this.logger.warn(`No data found with query: ${query}`);
      }

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to query data from InfluxDB:', error);
      throw new Error(`Failed to query data: ${errorMessage}`);
    }
  }
}

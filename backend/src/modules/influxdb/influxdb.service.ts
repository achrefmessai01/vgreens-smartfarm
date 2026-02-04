import {
  Logger,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { BucketsAPI, OrgsAPI } from '@influxdata/influxdb-client-apis';

@Injectable()
export class InfluxDBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfluxDBService.name);
  private client: InfluxDB | null = null;
  private writeApi: WriteApi | null = null;
  private queryApi: QueryApi | null = null;

  private readonly url: string;
  private readonly token: string;
  private readonly org: string;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('INFLUXDB_URL') || '';
    this.token = this.configService.get<string>('INFLUXDB_TOKEN') || '';
    this.org = this.configService.get<string>('INFLUXDB_ORG') || '';
    this.bucket = this.configService.get<string>('INFLUXDB_BUCKET') || '';
  }

  onModuleInit() {
    this.initializeClient();
  }

  onModuleDestroy() {
    void this.close();
  }

  private initializeClient(): void {
    const missingConfig: string[] = [];
    if (!this.url) missingConfig.push('INFLUXDB_URL');
    if (!this.token) missingConfig.push('INFLUXDB_TOKEN');
    if (!this.org) missingConfig.push('INFLUXDB_ORG');
    if (!this.bucket) missingConfig.push('INFLUXDB_BUCKET');

    if (missingConfig.length > 0) {
      this.logger.warn(
        `InfluxDB configuration is incomplete. Missing: ${missingConfig.join(', ')}. Some features may not work.`,
      );
      return;
    }

    try {
      this.client = new InfluxDB({
        url: this.url,
        token: this.token,
      });

      this.writeApi = this.client.getWriteApi(this.org, this.bucket, 's');
      this.queryApi = this.client.getQueryApi(this.org);

      this.logger.log(
        `InfluxDB v2 client initialized (url=${this.url}, org=${this.org}, bucket=${this.bucket})`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize InfluxDB client', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client || !this.queryApi) {
      const missingConfig: string[] = [];
      if (!this.url) missingConfig.push('INFLUXDB_URL');
      if (!this.token) missingConfig.push('INFLUXDB_TOKEN');
      if (!this.org) missingConfig.push('INFLUXDB_ORG');
      if (!this.bucket) missingConfig.push('INFLUXDB_BUCKET');

      const message =
        missingConfig.length > 0
          ? `InfluxDB client not initialized. Missing configuration: ${missingConfig.join(', ')}`
          : 'InfluxDB client is not initialized';

      this.logger.error(message);
      return { success: false, message };
    }

    try {
      // Simple health check using a lightweight Flux query
      const flux = 'buckets() |> limit(n:1)';

      await new Promise<void>((resolve, reject) => {
        this.queryApi.queryRows(flux, {
          next: () => {
            // If we receive at least one row, connection is working
            resolve();
          },
          error: (error) => {
            reject(error);
          },
          complete: () => {
            resolve();
          },
        });
      });

      this.logger.log('InfluxDB v2 connection test successful');
      return {
        success: true,
        message: 'InfluxDB connection successful',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('404') || errorMessage.includes('Not found')) {
        this.logger.error(
          `InfluxDB bucket not found. Bucket: "${this.bucket}"`,
        );
        return {
          success: false,
          message: `InfluxDB bucket "${this.bucket}" not found. Please verify it exists in your InfluxDB instance.`,
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
      if (this.writeApi) {
        this.writeApi
          .close()
          .then(() => this.logger.log('InfluxDB write API closed'))
          .catch((err) =>
            this.logger.error('Error closing InfluxDB write API', err),
          );
      }
      this.client = null;
      this.logger.log('InfluxDB client closed');
    }
  }

  async getBuckets(): Promise<string[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    try {
      const flux = 'buckets()';
      const names: string[] = [];
      const queryApi = this.queryApi;

      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            const o = tableMeta.toObject(row) as Record<string, unknown>;
            const name = o['name'];
            if (typeof name === 'string') {
              names.push(name);
            }
          },
          error: (error) => {
            reject(error);
          },
          complete: () => {
            resolve();
          },
        });
      });

      this.logger.debug(`Listed ${names.length} buckets: ${names.join(', ')}`);
      return names;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to list buckets from InfluxDB:', error);
      throw new Error(`Failed to list buckets: ${errorMessage}`);
    }
  }

  /**
   * Query data from a bucket by name. Uses Flux range + limit.
   * @param bucketName - Bucket name (e.g. tenant's influxBucketName)
   * @param options - start: Flux duration (e.g. -1h) or ISO date string; stop: optional ISO date string for date range; limit: max rows
   */
  async getBucketData(
    bucketName: string,
    options?: { start?: string; stop?: string; limit?: number },
  ): Promise<Record<string, unknown>[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const start = options?.start ?? '-1h';
    const stop = options?.stop;
    const limit = options?.limit ?? 100;
    const escapedBucket = bucketName
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

    // Use time(v: "ISO") when start/stop look like ISO timestamps
    const isIso = (s: string) =>
      s.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(s);
    const rangeStart = isIso(start)
      ? `time(v: "${start.replace(/"/g, '\\"')}")`
      : start;
    const rangeStop =
      stop && isIso(stop)
        ? `, stop: time(v: "${stop.replace(/"/g, '\\"')}")`
        : '';
    const rangeClause = `range(start: ${rangeStart}${rangeStop})`;

    const flux = `from(bucket: "${escapedBucket}")
  |> ${rangeClause}
  |> limit(n: ${limit})`;

    const rows: Record<string, unknown>[] = [];
    const queryApi = this.queryApi;

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, tableMeta) => {
          const o = tableMeta.toObject(row) as Record<string, unknown>;
          rows.push(o);
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        },
      });
    });

    this.logger.debug(
      `getBucketData("${bucketName}"): returned ${rows.length} rows`,
    );
    return rows;
  }

  /**
   * Returns all unique _field values from a bucket (e.g. "humidity", "co2", "temperature").
   * @param bucketName - Bucket name (e.g. tenant's influxBucketName)
   * @param options - start: Flux duration or ISO; stop: optional ISO for range
   */
  async getBucketFields(
    bucketName: string,
    options?: { start?: string; stop?: string },
  ): Promise<string[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const start = options?.start ?? '-1h';
    const stop = options?.stop;
    const escapedBucket = bucketName
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

    const isIso = (s: string) =>
      s.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(s);
    const rangeStart = isIso(start)
      ? `time(v: "${start.replace(/"/g, '\\"')}")`
      : start;
    const rangeStop =
      stop && isIso(stop)
        ? `, stop: time(v: "${stop.replace(/"/g, '\\"')}")`
        : '';
    const rangeClause = `range(start: ${rangeStart}${rangeStop})`;

    const flux = `from(bucket: "${escapedBucket}")
  |> ${rangeClause}
  |> keep(columns: ["_field"])
  |> distinct(column: "_field")`;

    const fields = new Set<string>();
    const queryApi = this.queryApi;

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, tableMeta) => {
          const o = tableMeta.toObject(row) as Record<string, unknown>;
          const field = o['_field'];
          if (typeof field === 'string') fields.add(field);
        },
        error: (error) => reject(error),
        complete: () => resolve(),
      });
    });

    const result = Array.from(fields).sort();
    this.logger.debug(
      `getBucketFields("${bucketName}"): ${result.length} unique fields`,
    );
    return result;
  }

  /**
   * Resolves INFLUXDB_ORG (name or 16-byte hex ID) to organization ID for API calls.
   */
  private async resolveOrgID(): Promise<string> {
    const org = this.org;
    if (!org) return '';

    // InfluxDB org IDs are 16 hex bytes (32 chars)
    const isHexId = /^[0-9a-fA-F]{32}$/.test(org);
    if (isHexId) return org;

    const influxDB =
      this.client ?? new InfluxDB({ url: this.url, token: this.token });
    const orgsAPI = new OrgsAPI(influxDB);
    const res = await orgsAPI.getOrgs({ org });
    const orgID = res.orgs?.[0]?.id;
    if (!orgID) {
      throw new Error(
        `Organization "${org}" not found in InfluxDB. Use org name or 32-char hex org ID in INFLUXDB_ORG.`,
      );
    }
    return orgID;
  }

  /**
   * Creates a bucket in InfluxDB via BucketsAPI.
   * Idempotent: if the bucket already exists (409), resolves successfully.
   */
  async createBucket(
    name: string,
    options?: { retentionSeconds?: number },
  ): Promise<void> {
    if (!this.url || !this.token || !this.org) {
      this.logger.warn(
        'Skipping bucket creation: INFLUXDB_URL, INFLUXDB_TOKEN or INFLUXDB_ORG is missing',
      );
      return;
    }

    const retentionSeconds = options?.retentionSeconds ?? 60 * 60 * 24 * 30;
    const retentionRules =
      retentionSeconds > 0
        ? [{ type: 'expire' as const, everySeconds: retentionSeconds }]
        : [];

    const influxDB =
      this.client ?? new InfluxDB({ url: this.url, token: this.token });
    const bucketsAPI = new BucketsAPI(influxDB);

    try {
      const orgID = await this.resolveOrgID();
      await bucketsAPI.postBuckets({
        body: {
          orgID,
          name,
          retentionRules,
        },
      });
      this.logger.log(`Created InfluxDB bucket "${name}"`);
    } catch (error: unknown) {
      const statusCode =
        error && typeof error === 'object' && 'statusCode' in error
          ? (error as { statusCode: number }).statusCode
          : undefined;
      if (statusCode === 409) {
        this.logger.debug(`InfluxDB bucket "${name}" already exists`);
        return;
      }
      this.logger.error(`Error creating InfluxDB bucket "${name}"`, error);
      throw error;
    }
  }
}

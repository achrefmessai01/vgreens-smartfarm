import {
  Logger,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { FieldMeanMetric, ParDliPoint, ParDliResult } from './dto';
import { ConfigService } from '@nestjs/config';
import { BucketsAPI, OrgsAPI } from '@influxdata/influxdb-client-apis';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import {
  AIR_TEMP_CORRECTION,
  correctFieldMeans,
  correctRawRows,
  isTargetBucket,
} from './air-temperature-correction';

const DLI_INTERVAL_SECONDS = 300;
const LUX_TO_PAR = 55;

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
   * Optional filters (field, greenhouse, device, level) restrict to a single series for history charts.
   * @param bucketName - Bucket name (e.g. tenant's influxBucketName)
   * @param options - start, stop, limit; optional field, greenhouse, device, level for filtering
   */
  async getBucketData(
    bucketName: string,
    options?: {
      start?: string;
      stop?: string;
      limit?: number;
      field?: string;
      greenhouse?: string;
      device?: string;
      level?: string;
    },
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

    const escapeFluxString = (v: string) =>
      v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const filterParts: string[] = [];
    if (options?.field) {
      filterParts.push(`r["_field"] == "${escapeFluxString(options.field)}"`);
    }
    if (options?.greenhouse != null && options.greenhouse !== '') {
      filterParts.push(
        `r["greenhouse"] == "${escapeFluxString(options.greenhouse)}"`,
      );
    }
    if (options?.device != null && options.device !== '') {
      filterParts.push(`r["device"] == "${escapeFluxString(options.device)}"`);
    }
    // Skip level filter when "unknown" so we match rows that may not have a level tag
    if (
      options?.level != null &&
      options.level !== '' &&
      options.level.toLowerCase() !== 'unknown'
    ) {
      filterParts.push(`r["level"] == "${escapeFluxString(options.level)}"`);
    }
    const filterClause =
      filterParts.length > 0
        ? `|> filter(fn: (r) => ${filterParts.join(' and ')})\n  `
        : '';

    const flux = `from(bucket: "${escapedBucket}")
  |> ${rangeClause}
  ${filterClause}|> sort(columns: ["_time"])
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

    await this.applyAirTemperatureCorrection(bucketName, rows, {
      start,
      stop,
    });

    this.logger.debug(
      `getBucketData("${bucketName}"): returned ${rows.length} rows`,
    );
    return rows;
  }

  async getBucketDataLastPerSeries(
    bucketName: string,
    options?: {
      start?: string;
      stop?: string;
      field?: string;
      greenhouse?: string;
      device?: string;
      level?: string;
    },
  ): Promise<Record<string, unknown>[]> {
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

    const escapeFluxString = (v: string) =>
      v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const filterParts: string[] = [];
    if (options?.field) {
      filterParts.push(`r["_field"] == "${escapeFluxString(options.field)}"`);
    }
    if (options?.greenhouse != null && options.greenhouse !== '') {
      filterParts.push(
        `r["greenhouse"] == "${escapeFluxString(options.greenhouse)}"`,
      );
    }
    if (options?.device != null && options.device !== '') {
      filterParts.push(`r["device"] == "${escapeFluxString(options.device)}"`);
    }
    if (
      options?.level != null &&
      options.level !== '' &&
      options.level.toLowerCase() !== 'unknown'
    ) {
      filterParts.push(`r["level"] == "${escapeFluxString(options.level)}"`);
    }
    const filterClause =
      filterParts.length > 0
        ? `|> filter(fn: (r) => ${filterParts.join(' and ')})\n  `
        : '';

    const flux = `from(bucket: "${escapedBucket}")
  |> ${rangeClause}
  ${filterClause}|> last()`;

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

    await this.applyAirTemperatureCorrection(bucketName, rows, {
      start,
      stop,
    });

    this.logger.debug(
      `getBucketDataLastPerSeries("${bucketName}"): returned ${rows.length} rows`,
    );
    return rows;
  }

  async getBucketFieldMeansLastMinutes(
    bucketName: string,
    options: {
      greenhouse?: string;
      windowMinutes?: number;
      start?: string;
      stop?: string;
    },
  ): Promise<FieldMeanMetric[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const escapedBucket = bucketName
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

    const escapeFluxString = (v: string) =>
      v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const filterParts: string[] = [];
    if (options.greenhouse != null && options.greenhouse !== '') {
      filterParts.push(
        `r["greenhouse"] == "${escapeFluxString(options.greenhouse)}"`,
      );
    }

    const filterClause =
      filterParts.length > 0
        ? `|> filter(fn: (r) => ${filterParts.join(' and ')})\n  `
        : '';

    const windowMinutes = options.windowMinutes ?? 5;
    const useAbsolute =
      typeof options.start === 'string' &&
      typeof options.stop === 'string' &&
      !Number.isNaN(new Date(options.start).getTime()) &&
      !Number.isNaN(new Date(options.stop).getTime());
    const rangeClause = useAbsolute
      ? `|> range(start: time(v: "${escapeFluxString(options.start)}"), stop: time(v: "${escapeFluxString(options.stop)}"))`
      : `|> range(start: -${windowMinutes}m)`;

    // Group by `_field` plus BOTH `greenhouse` and `chamber`. Different
    // tenants tag their location with one or the other (see
    // `farm-data-live.ts` which falls back from `greenhouse` to `chamber`),
    // and keying only on `greenhouse` would lose every row for the
    // `chamber`-tagged tenants. With this grouping each row carries
    // exactly one non-empty location tag.
    const flux = `from(bucket: "${escapedBucket}")
  ${rangeClause}
  ${filterClause}|> group(columns: ["_field", "greenhouse", "chamber"])
  |> mean()
  |> keep(columns: ["_time", "_value", "_field", "greenhouse", "chamber"])`;

    const rows: FieldMeanMetric[] = [];
    const queryApi = this.queryApi;

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, tableMeta) => {
          const o = tableMeta.toObject(row) as Record<string, unknown>;
          const value = Number(o._value);
          if (Number.isNaN(value)) {
            return;
          }

          const time =
            o._time instanceof Date
              ? o._time
              : new Date(String((o as { _time?: string })._time ?? ''));
          const field = typeof o._field === 'string' ? o._field : undefined;
          if (!field) {
            return;
          }

          const greenhouse =
            typeof o.greenhouse === 'string' && o.greenhouse !== ''
              ? o.greenhouse
              : undefined;
          const chamber =
            typeof o.chamber === 'string' && o.chamber !== ''
              ? o.chamber
              : undefined;

          rows.push({
            field,
            greenhouse,
            chamber,
            time,
            value,
          });
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        },
      });
    });

    if (isTargetBucket(bucketName)) {
      const luxMeans = await this.fetchLuxMeansForCorrection(bucketName, {
        greenhouse: options.greenhouse,
        windowMinutes,
        start: useAbsolute ? options.start : undefined,
        stop: useAbsolute ? options.stop : undefined,
      });
      correctFieldMeans(rows, luxMeans);
    }

    this.logger.debug(
      `getBucketFieldMeansLastMinutes("${bucketName}", greenhouse="${options.greenhouse ?? ''}", ${useAbsolute ? `start=${options.start}, stop=${options.stop}` : `windowMinutes=${windowMinutes}`}): returned ${rows.length} rows`,
    );
    return rows;
  }

  /**
   * Returns today's PAR/DLI summary for a tenant bucket:
   *   - `todaysGraphData`: cumulative DLI curve in mol m⁻², one point per
   *     5-minute window starting at midnight (UTC).
   *   - `currentPPFD`: latest PPFD reading in µmol m⁻² s⁻¹ (mean lux of the
   *     last 5-minute window / 55).
   *   - `currentDLI`: latest cumulative DLI value in mol m⁻².
   *
   * Pipeline:
   *   1. Pull every `lux` reading in the bucket since the start of today.
   *   2. Collapse all device series with `group()` so each 5-minute window
   *      mean is across every lux sensor in the tenant bucket.
   *   3. Aggregate to 5-minute (`DLI_INTERVAL_SECONDS`) means.
   *   4. Per window: PPFD = lux / 55 (µmol m⁻² s⁻¹) and DLI contribution =
   *      PPFD × 300 s / 1e6 (mol m⁻²).
   *   5. `cumulativeSum` over the DLI column gives the running curve.
   *
   * The `/55` factor is the project-wide convention for converting natural-
   * daylight lux to PPFD; we intentionally bypass any pre-computed `par`
   * fields so the dashboard uses one consistent calibration.
   *
   * We deliberately do not filter by the `greenhouse` tag: per-tenant tag
   * values are inconsistent (some tenants tag with `chamber`, some apply
   * SensorConfig overrides that diverge from the raw Influx tag), so the
   * filter would silently match zero rows for some tenants. Scoping by
   * bucket is sufficient because each tenant has their own bucket.
   */
  async getTodayParDli(bucketName: string): Promise<ParDliResult> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const flux = `
import "date"

from(bucket: "${escape(bucketName)}")
  |> range(start: date.truncate(t: now(), unit: 1d))
  |> filter(fn: (r) => r["_field"] == "lux")
  |> group()
  |> aggregateWindow(every: ${DLI_INTERVAL_SECONDS}s, fn: mean, createEmpty: false)
  |> sort(columns: ["_time"])
  |> map(fn: (r) => ({
      _time: r._time,
      ppfd: float(v: r._value) / ${LUX_TO_PAR}.0,
      _value: float(v: r._value) / ${LUX_TO_PAR}.0 * ${DLI_INTERVAL_SECONDS}.0 / 1000000.0
    }))
  |> cumulativeSum(columns: ["_value"])
`;

    const points: ParDliPoint[] = [];
    let currentPPFD: number | undefined;
    let currentDLI: number | undefined;
    const queryApi = this.queryApi;

    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            const o = tableMeta.toObject(row) as Record<string, unknown>;
            const dli = Number(o._value);
            const ppfd = Number(o.ppfd);
            if (Number.isNaN(dli) || Number.isNaN(ppfd)) return;

            const time =
              o._time instanceof Date
                ? o._time
                : new Date(String((o as { _time?: string })._time ?? ''));

            points.push({ time, dli });
            currentPPFD = ppfd;
            currentDLI = dli;
          },
          error: reject,
          complete: resolve,
        });
      });
    } catch (error) {
      this.logger.warn(
        `getTodayParDli failed for bucket "${bucketName}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { todaysGraphData: [] };
    }

    this.logger.debug(
      `getTodayParDli("${bucketName}") → ${points.length} points`,
    );
    return {
      currentPPFD,
      currentDLI,
      todaysGraphData: points,
    };
  }

  /**
   * Applies the per-tenant air-temperature correction to raw row results.
   * No-op for non-target buckets and for result sets without any air_*
   * temperature rows. Fetches lux_03 / lux_08 over the same time range only
   * when the existing result set doesn't already contain them (e.g. the
   * caller filtered to a single air device).
   */
  private async applyAirTemperatureCorrection(
    bucketName: string,
    rows: Record<string, unknown>[],
    range: { start: string; stop?: string },
  ): Promise<void> {
    if (!isTargetBucket(bucketName)) return;

    const hasAirRow = rows.some((r) => {
      const device = typeof r.device === 'string' ? r.device.toLowerCase() : '';
      const field = typeof r._field === 'string' ? r._field.toLowerCase() : '';
      return (
        device.startsWith(AIR_TEMP_CORRECTION.airDevicePrefix) &&
        field === AIR_TEMP_CORRECTION.airFieldName
      );
    });
    if (!hasAirRow) return;

    const hasAllLuxRows = AIR_TEMP_CORRECTION.luxDevices.every((id) =>
      rows.some((r) => {
        const device =
          typeof r.device === 'string' ? r.device.toLowerCase() : '';
        const field =
          typeof r._field === 'string' ? r._field.toLowerCase() : '';
        return field === AIR_TEMP_CORRECTION.luxFieldName && device === id;
      }),
    );

    const extraLuxRows = hasAllLuxRows
      ? undefined
      : await this.fetchLuxRowsForCorrection(bucketName, range);
    correctRawRows(rows, { extraLuxRows });
  }

  /**
   * Fetches lux_03 and lux_08 rows over the given time range. Used only by
   * `applyAirTemperatureCorrection` when the main query's filters excluded
   * lux from the result. Returns [] on error (correction degrades gracefully).
   */
  private async fetchLuxRowsForCorrection(
    bucketName: string,
    range: { start: string; stop?: string },
  ): Promise<Record<string, unknown>[]> {
    if (!this.client || !this.queryApi) return [];

    const escape = (v: string) =>
      v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const isIso = (s: string) =>
      s.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(s);
    const rangeStart = isIso(range.start)
      ? `time(v: "${escape(range.start)}")`
      : range.start;
    const rangeStop =
      range.stop && isIso(range.stop)
        ? `, stop: time(v: "${escape(range.stop)}")`
        : '';
    const luxDeviceFilter = AIR_TEMP_CORRECTION.luxDevices
      .map((d) => `r["device"] == "${escape(d)}"`)
      .join(' or ');

    const flux = `from(bucket: "${escape(bucketName)}")
  |> range(start: ${rangeStart}${rangeStop})
  |> filter(fn: (r) => r["_field"] == "${escape(AIR_TEMP_CORRECTION.luxFieldName)}" and (${luxDeviceFilter}))`;

    const rows: Record<string, unknown>[] = [];
    const queryApi = this.queryApi;

    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            rows.push(tableMeta.toObject(row) as Record<string, unknown>);
          },
          error: reject,
          complete: resolve,
        });
      });
    } catch (error) {
      this.logger.warn(
        `fetchLuxRowsForCorrection failed for bucket "${bucketName}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
    return rows;
  }

  /**
   * Fetches the mean lux_03 / lux_08 over the same window/scope as the main
   * means query. Returns nullable per-device means (undefined when a device
   * has no rows in the window). On error returns {}.
   */
  private async fetchLuxMeansForCorrection(
    bucketName: string,
    options: {
      greenhouse?: string;
      windowMinutes: number;
      start?: string;
      stop?: string;
    },
  ): Promise<{ lux03?: number; lux08?: number }> {
    if (!this.client || !this.queryApi) return {};

    const escape = (v: string) =>
      v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const useAbsolute =
      typeof options.start === 'string' &&
      typeof options.stop === 'string' &&
      !Number.isNaN(new Date(options.start).getTime()) &&
      !Number.isNaN(new Date(options.stop).getTime());
    const rangeClause = useAbsolute
      ? `|> range(start: time(v: "${escape(options.start!)}"), stop: time(v: "${escape(options.stop!)}"))`
      : `|> range(start: -${options.windowMinutes}m)`;

    const greenhouseClause =
      options.greenhouse && options.greenhouse !== ''
        ? `and r["greenhouse"] == "${escape(options.greenhouse)}"`
        : '';
    const luxDeviceFilter = AIR_TEMP_CORRECTION.luxDevices
      .map((d) => `r["device"] == "${escape(d)}"`)
      .join(' or ');

    const flux = `from(bucket: "${escape(bucketName)}")
  ${rangeClause}
  |> filter(fn: (r) => r["_field"] == "${escape(AIR_TEMP_CORRECTION.luxFieldName)}" and (${luxDeviceFilter}) ${greenhouseClause})
  |> group(columns: ["device"])
  |> mean()
  |> keep(columns: ["device", "_value"])`;

    const result: { lux03?: number; lux08?: number } = {};
    const queryApi = this.queryApi;

    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            const o = tableMeta.toObject(row) as Record<string, unknown>;
            const device =
              typeof o.device === 'string' ? o.device.toLowerCase() : '';
            const value = Number(o._value);
            if (!Number.isFinite(value)) return;
            if (device === 'lux_03') result.lux03 = value;
            else if (device === 'lux_08') result.lux08 = value;
          },
          error: reject,
          complete: resolve,
        });
      });
    } catch (error) {
      this.logger.warn(
        `fetchLuxMeansForCorrection failed for bucket "${bucketName}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return {};
    }
    return result;
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

  /** Returns all unique values for a given tag in a bucket. */
  private async getUniqueTagValues(
    bucketName: string,
    tag: string,
  ): Promise<string[]> {
    if (!this.client || !this.queryApi) {
      this.logger.warn('InfluxDB client not initialized');
      return [];
    }

    const escaped = bucketName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const flux = `import "influxdata/influxdb/schema"
schema.tagValues(bucket: "${escaped}", tag: "${tag}")`;

    const values: string[] = [];
    const queryApi = this.queryApi;

    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            const o = tableMeta.toObject(row) as Record<string, unknown>;
            const val = o['_value'];
            if (typeof val === 'string' && val) values.push(val);
          },
          error: reject,
          complete: resolve,
        });
      });
    } catch (error) {
      this.logger.warn(
        `getUniqueTagValues("${tag}") failed for bucket "${bucketName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return values.sort();
  }

  /** Returns all unique device tag values stored in the given bucket. */
  async getUniqueDevices(bucketName: string): Promise<string[]> {
    return this.getUniqueTagValues(bucketName, 'device');
  }

  /** Returns all unique greenhouse tag values stored in the given bucket. */
  async getUniqueGreenhouses(bucketName: string): Promise<string[]> {
    return this.getUniqueTagValues(bucketName, 'greenhouse');
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

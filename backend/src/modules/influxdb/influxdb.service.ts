import {
  Logger,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  DeviceActivityPoint,
  DeviceFieldValue,
  DeviceStatus,
  FieldMeanMetric,
  ParDliBandPoint,
  ParDliPoint,
  ParDliResult,
} from './dto';
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
const DLI_BAND_LOOKBACK_DAYS = 14;
const SECONDS_PER_HOUR = 3600;

/**
 * IANA timezone names only contain `[A-Za-z0-9/_+-]`. Anything else
 * means the client sent something unexpected (or potentially a Flux
 * injection attempt) and we fall back to UTC. Validating with
 * `Intl.DateTimeFormat` would also work, but the regex is cheap and
 * doesn't depend on the Node ICU build.
 */
function sanitizeTimezone(tz?: string): string {
  if (!tz) return 'UTC';
  if (!/^[A-Za-z0-9_+/\-]+$/.test(tz)) return 'UTC';
  return tz;
}

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

  /**
   * The earliest REAL datapoint for `device`/`field` at or after `since` (an
   * ISO timestamp). Backs sensor calibration: `getBucketData` returns raw
   * points (no aggregateWindow/fill/interpolate), sorted ascending by time,
   * so `limit: 1` yields the first genuine transmission after the operator
   * pressed calibrate. Returns null when the sensor hasn't transmitted yet.
   */
  async getEarliestReadingSince(
    bucketName: string,
    options: { device: string; field: string; since: string },
  ): Promise<{ value: number; time: string } | null> {
    const rows = await this.getBucketData(bucketName, {
      start: options.since,
      device: options.device,
      field: options.field,
      limit: 1,
    });
    const row = rows[0];
    if (!row) return null;
    const value =
      typeof row._value === 'number' ? row._value : Number(row._value);
    if (!Number.isFinite(value)) return null;
    const time = typeof row._time === 'string' ? row._time : '';
    return { value, time };
  }

  /**
   * The latest raw value for `device`/`field`, or null if none in the lookback
   * window. Used to compute a sensor's live corrected reading on read.
   */
  async getLatestReadingValue(
    bucketName: string,
    options: { device: string; field: string; start?: string },
  ): Promise<number | null> {
    const rows = await this.getBucketDataLastPerSeries(bucketName, {
      start: options.start ?? '-30d',
      device: options.device,
      field: options.field,
    });
    const row = rows[0];
    if (!row) return null;
    const value =
      typeof row._value === 'number' ? row._value : Number(row._value);
    return Number.isFinite(value) ? value : null;
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
   * Returns today's PAR/DLI summary for a tenant bucket, optionally
   * scoped to a specific list of lux devices.
   *
   * Pipeline:
   *   1. Pull every `lux` reading since the start of today, filtered to
   *      the supplied `devices` when provided.
   *   2. Collapse all matching device series with `group()` so each
   *      5-minute window mean is across the selected lux sensors.
   *   3. Aggregate to 5-minute (`DLI_INTERVAL_SECONDS`) means.
   *   4. Per window: PPFD = lux / 55 (µmol m⁻² s⁻¹) and DLI contribution =
   *      PPFD × 300 s / 1e6 (mol m⁻²).
   *   5. `cumulativeSum` over the DLI column gives the running curve.
   *
   * Pass an empty/undefined `devices` list to fall back to "all lux in the
   * bucket" — used for tenants with no sensor→greenhouse mapping yet.
   *
   * The `/55` factor is the project-wide convention for converting natural-
   * daylight lux to PPFD; we intentionally bypass any pre-computed `par`
   * fields so the dashboard uses one consistent calibration.
   *
   * The historical envelope (`fetchDliBand`) is computed with the same
   * device filter so today's curve and the band stay statistically
   * comparable (see the comment block on `fetchDliBand`).
   *
   * No greenhouse tag filter is applied — the deprecated InfluxDB
   * `greenhouse` tag is never used by this path. Devices are escaped
   * before being interpolated into Flux even though they come from our
   * own Postgres table — defence in depth.
   */
  async getParDliForDevices(
    bucketName: string,
    options: { devices?: string[]; timezone?: string } = {},
  ): Promise<ParDliResult> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const tz = sanitizeTimezone(options.timezone);
    const deviceFilter = this.buildDeviceFilterClause(options.devices);

    const flux = `
import "date"
import "timezone"

option location = timezone.location(name: "${escape(tz)}")

from(bucket: "${escape(bucketName)}")
  |> range(start: date.truncate(t: now(), unit: 1d))
  |> filter(fn: (r) => r["_field"] == "lux"${deviceFilter})
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
        `getParDliForDevices failed for bucket "${bucketName}" (devices=${options.devices?.length ?? 0}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { todaysGraphData: [], lowerEdge: [], upperEdge: [] };
    }

    const { lowerEdge, upperEdge } = await this.fetchDliBand(
      bucketName,
      tz,
      options.devices,
    );

    this.logger.debug(
      `getParDliForDevices("${bucketName}", devices=${options.devices?.length ?? 0}) → ${points.length} points`,
    );
    return {
      currentPPFD,
      currentDLI,
      todaysGraphData: points,
      lowerEdge,
      upperEdge,
    };
  }

  /**
   * Builds the additional Flux predicate (` and (r["device"] == "X" or ...)`)
   * for filtering lux queries to a specific device list. Returns an empty
   * string when no devices are supplied, leaving the query unfiltered.
   */
  private buildDeviceFilterClause(devices?: string[]): string {
    if (!devices || devices.length === 0) return '';
    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const predicates = devices
      .map((d) => `r["device"] == "${escape(d)}"`)
      .join(' or ');
    return ` and (${predicates})`;
  }

  /**
   * Builds the historical PAR/DLI envelope for the in-app chart.
   *
   * Statistic used: **per-day, per-hour mean lux**, then per hour-of-day
   * the min and max across the last `DLI_BAND_LOOKBACK_DAYS` whole days.
   * The lower/upper edges therefore represent "cumulative DLI on the
   * dimmest day in the last 14 days" and "…on the brightest day".
   *
   * Why mean (not min/max of raw samples)? Today's curve aggregates lux
   * across all sensors with `mean`. If the band used min/max of any raw
   * reading, it would track the dimmest and brightest *sensors* in the
   * greenhouse — a much wider, fundamentally different statistic from
   * the curve plotted on top, making the band useless for "is today
   * inside the typical range?" comparisons. Matching aggregations lets
   * the chart answer that question directly.
   *
   * Flux's `option location` aligns `aggregateWindow` to local hour
   * boundaries and lets `date.hour` return the local hour 0–23. This is
   * critical for tenants outside UTC: bucketing in UTC would shift the
   * band by the offset and wrap high cumulative values to the start of
   * the chart (e.g. Germany's UTC+2 manifested as a "wall" at hour 0).
   *
   * Hours with no samples on any of the lookback days emit a point with a
   * null `dli`, which the chart renders as a gap rather than zero so it's
   * visually obvious that the envelope is missing rather than implying
   * "no light expected".
   *
   * Returns empty arrays on Flux error so the caller can still serve
   * today's curve.
   */
  private async fetchDliBand(
    bucketName: string,
    tz: string,
    devices?: string[],
  ): Promise<{
    lowerEdge: ParDliBandPoint[];
    upperEdge: ParDliBandPoint[];
  }> {
    if (!this.client || !this.queryApi) {
      return { lowerEdge: [], upperEdge: [] };
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const deviceFilter = this.buildDeviceFilterClause(devices);

    // One hourly mean per (day, hour) — the cross-sensor average lux for
    // that hour. The JS side then takes min/max across days per hour to
    // produce the envelope edges.
    const flux = `
import "date"
import "timezone"

option location = timezone.location(name: "${escape(tz)}")

todayStart = date.truncate(t: now(), unit: 1d)

from(bucket: "${escape(bucketName)}")
  |> range(start: date.sub(d: ${DLI_BAND_LOOKBACK_DAYS}d, from: todayStart), stop: todayStart)
  |> filter(fn: (r) => r["_field"] == "lux"${deviceFilter})
  |> group()
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false, timeSrc: "_start")
  |> map(fn: (r) => ({ _time: r._time, _value: r._value, hour: date.hour(t: r._time) }))
`;

    const hourlyMeansByHour = new Map<number, number[]>();
    const queryApi = this.queryApi;

    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, tableMeta) => {
            const o = tableMeta.toObject(row) as Record<string, unknown>;
            const value = Number(o._value);
            const hour = Number(o.hour);
            if (!Number.isFinite(value) || !Number.isFinite(hour)) return;
            if (hour < 0 || hour > 23) return;

            const list = hourlyMeansByHour.get(hour);
            if (list) list.push(value);
            else hourlyMeansByHour.set(hour, [value]);
          },
          error: reject,
          complete: resolve,
        });
      });
    } catch (error) {
      this.logger.warn(
        `fetchDliBand failed for bucket "${bucketName}" tz "${tz}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { lowerEdge: [], upperEdge: [] };
    }

    const hourToDli = SECONDS_PER_HOUR / 1_000_000;

    const lowerEdge: ParDliBandPoint[] = [];
    const upperEdge: ParDliBandPoint[] = [];
    let cumulLower = 0;
    let cumulUpper = 0;

    for (let h = 0; h < 24; h++) {
      const dailyMeans = hourlyMeansByHour.get(h);
      if (dailyMeans && dailyMeans.length > 0) {
        const minLux = Math.min(...dailyMeans);
        const maxLux = Math.max(...dailyMeans);
        cumulLower += (minLux / LUX_TO_PAR) * hourToDli;
        cumulUpper += (maxLux / LUX_TO_PAR) * hourToDli;
        lowerEdge.push({ hour: h, dli: cumulLower });
        upperEdge.push({ hour: h, dli: cumulUpper });
      } else {
        lowerEdge.push({ hour: h });
        upperEdge.push({ hour: h });
      }
    }

    this.logger.debug(
      `fetchDliBand("${bucketName}", tz="${tz}") → ${hourlyMeansByHour.size} hours populated`,
    );

    return { lowerEdge, upperEdge };
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

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const useAbsolute =
      typeof options.start === 'string' &&
      typeof options.stop === 'string' &&
      !Number.isNaN(new Date(options.start).getTime()) &&
      !Number.isNaN(new Date(options.stop).getTime());
    const rangeClause = useAbsolute
      ? `|> range(start: time(v: "${escape(options.start)}"), stop: time(v: "${escape(options.stop)}"))`
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
   * Maps each device in the bucket to the device profile it reports via the
   * `profile` tag. Looks back 30 days (the same window `schema.tagValues`
   * defaults to, and the buckets' retention). When a device has written
   * points under more than one profile in the window, the most recent point
   * wins. Devices without profile-tagged points are absent from the map.
   * Returns an empty map on error so callers degrade gracefully.
   */
  async getDeviceProfiles(
    bucketName: string,
    options?: { device?: string },
  ): Promise<Map<string, string>> {
    if (!this.client || !this.queryApi) {
      this.logger.warn('InfluxDB client not initialized');
      return new Map();
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const deviceClause = options?.device
      ? `\n  |> filter(fn: (r) => r["device"] == "${escape(options.device)}")`
      : '';
    const flux = `from(bucket: "${escape(bucketName)}")
  |> range(start: -30d)
  |> filter(fn: (r) => exists r["device"] and exists r["profile"])${deviceClause}
  |> group(columns: ["device", "profile"])
  |> last()
  |> keep(columns: ["device", "profile", "_time"])`;

    const latestByDevice = new Map<string, { profile: string; time: number }>();
    try {
      const rows = await this.runQueryRows(flux);
      for (const row of rows) {
        const device = typeof row.device === 'string' ? row.device : '';
        const profile = typeof row.profile === 'string' ? row.profile : '';
        if (!device || !profile) continue;
        const timeMs =
          row._time instanceof Date
            ? row._time.getTime()
            : new Date(
                String((row as { _time?: string })._time ?? ''),
              ).getTime();
        const time = Number.isNaN(timeMs) ? 0 : timeMs;
        const existing = latestByDevice.get(device);
        if (!existing || time > existing.time) {
          latestByDevice.set(device, { profile, time });
        }
      }
    } catch (error) {
      this.logger.warn(
        `getDeviceProfiles failed for bucket "${bucketName}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return new Map();
    }

    const result = new Map<string, string>();
    for (const [device, { profile }] of latestByDevice) {
      result.set(device, profile);
    }
    this.logger.debug(
      `getDeviceProfiles("${bucketName}"): ${result.size} devices with profiles`,
    );
    return result;
  }

  /**
   * Builds a Flux `range(...)` clause. `start` may be a relative duration
   * (e.g. `-7d`) or an absolute ISO timestamp; `stop` is an optional absolute
   * ISO timestamp. ISO values are wrapped in `time(v: ...)`.
   */
  private buildRangeClause(start: string, stop?: string): string {
    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const isIso = (s: string) =>
      s.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(s);
    const startExpr = isIso(start)
      ? `time(v: "${escape(start)}")`
      : escape(start);
    const stopExpr =
      stop && isIso(stop) ? `, stop: time(v: "${escape(stop)}")` : '';
    return `range(start: ${startExpr}${stopExpr})`;
  }

  /** Runs a Flux query and collects every row as a plain object. */
  private async runQueryRows(flux: string): Promise<Record<string, unknown>[]> {
    if (!this.client || !this.queryApi) {
      throw new Error('InfluxDB client is not initialized');
    }
    const rows: Record<string, unknown>[] = [];
    const queryApi = this.queryApi;
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, tableMeta) => {
          rows.push(tableMeta.toObject(row) as Record<string, unknown>);
        },
        error: reject,
        complete: resolve,
      });
    });
    return rows;
  }

  /**
   * Per-device liveness/inventory for the device-status dashboard. This is the
   * in-app port of `backend/scripts/message_inventory.py`: it classifies each
   * device as working / stale / heartbeat-only and reports when it was last
   * alive (last uplink, from the server-side `system` monitor) vs. when it last
   * sent real sensor data (any non-`system` measurement).
   *
   * Only devices that appear in the bucket within the window are returned;
   * `never-seen` devices (configured but silent) are added by the resolver from
   * `SensorConfig`.
   *
   * The `stale` cutoff is per device class: edge devices (`vgreens-XX-XX`, push
   * ~3x/day) get `edgeStaleHours`; everything else (Air_/Soil_ sensors, ~5 min)
   * gets the much shorter `regularStaleMinutes`.
   */
  async getDeviceStatusInventory(
    bucketName: string,
    options: {
      start: string;
      stop?: string;
      regularStaleMinutes?: number;
      edgeStaleHours?: number;
      now?: Date;
    },
  ): Promise<DeviceStatus[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const bucket = escape(bucketName);
    const rangeClause = this.buildRangeClause(options.start, options.stop);
    const regularStaleMinutes = options.regularStaleMinutes ?? 30;
    const edgeStaleHours = options.edgeStaleHours ?? 26;
    const nowMs = (options.now ?? new Date()).getTime();

    // Q1: last timestamp per (device, measurement) — message types + last-seen.
    const q1 = `from(bucket: "${bucket}")
  |> ${rangeClause}
  |> group(columns: ["device", "_measurement"])
  |> last()
  |> keep(columns: ["device", "_measurement", "_time"])`;

    // Q2: latest connectivity state per device (uplink age + online flag).
    const q2 = `from(bucket: "${bucket}")
  |> ${rangeClause}
  |> filter(fn: (r) => r["_measurement"] == "system" and (r["_field"] == "last_uplink_age_min" or r["_field"] == "online"))
  |> group(columns: ["device", "_field"])
  |> last()
  |> keep(columns: ["device", "_field", "_time", "_value"])`;

    // Q3: real (non-system) point count per device.
    const q3 = `from(bucket: "${bucket}")
  |> ${rangeClause}
  |> filter(fn: (r) => r["_measurement"] != "system")
  |> group(columns: ["device"])
  |> count(column: "_value")
  |> keep(columns: ["device", "_value"])`;

    // Q4: server-side `system` monitor point count per device.
    const q4 = `from(bucket: "${bucket}")
  |> ${rangeClause}
  |> filter(fn: (r) => r["_measurement"] == "system")
  |> group(columns: ["device"])
  |> count(column: "_value")
  |> keep(columns: ["device", "_value"])`;

    // Q5: latest value of each real (non-system) field per device.
    const q5 = `from(bucket: "${bucket}")
  |> ${rangeClause}
  |> filter(fn: (r) => r["_measurement"] != "system")
  |> group(columns: ["device", "_field"])
  |> last()
  |> keep(columns: ["device", "_field", "_value", "_time"])`;

    const [perMeas, sysRows, realCounts, hbCounts, lastValueRows] =
      await Promise.all([
        this.runQueryRows(q1),
        this.runQueryRows(q2),
        this.runQueryRows(q3),
        this.runQueryRows(q4),
        this.runQueryRows(q5),
      ]);

    const toTime = (v: unknown): Date | undefined => {
      if (v instanceof Date) return v;
      if (typeof v === 'string' && v) {
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? undefined : d;
      }
      return undefined;
    };
    const shortMeas = (m: string) => m.replace(/^vgreens_/, '');

    // Aggregate Q1 by device → measurements + last real-data timestamp.
    const measByDevice = new Map<
      string,
      { measurements: Set<string>; lastReal?: Date }
    >();
    for (const row of perMeas) {
      const device = typeof row.device === 'string' ? row.device : '';
      const measurement =
        typeof row._measurement === 'string' ? row._measurement : '';
      if (!device || !measurement) continue;
      let entry = measByDevice.get(device);
      if (!entry) {
        entry = { measurements: new Set() };
        measByDevice.set(device, entry);
      }
      entry.measurements.add(measurement);
      if (measurement !== 'system') {
        const t = toTime(row._time);
        if (t && (!entry.lastReal || t > entry.lastReal)) entry.lastReal = t;
      }
    }

    // Q2 → per-device { lastAlive, online }.
    const sysByDevice = new Map<
      string,
      { lastAlive?: Date; online?: boolean }
    >();
    for (const row of sysRows) {
      const device = typeof row.device === 'string' ? row.device : '';
      const field = typeof row._field === 'string' ? row._field : '';
      if (!device) continue;
      let entry = sysByDevice.get(device);
      if (!entry) {
        entry = {};
        sysByDevice.set(device, entry);
      }
      if (field === 'last_uplink_age_min') {
        const t = toTime(row._time);
        const ageMin = Number(row._value);
        if (t && Number.isFinite(ageMin)) {
          entry.lastAlive = new Date(t.getTime() - ageMin * 60_000);
        }
      } else if (field === 'online') {
        const v = row._value;
        entry.online = v === true || Number(v) === 1;
      }
    }

    const countByDevice = (rows: Record<string, unknown>[]) => {
      const m = new Map<string, number>();
      for (const row of rows) {
        const device = typeof row.device === 'string' ? row.device : '';
        if (!device) continue;
        m.set(device, (m.get(device) ?? 0) + (Number(row._value) || 0));
      }
      return m;
    };
    const realByDevice = countByDevice(realCounts);
    const hbByDevice = countByDevice(hbCounts);

    // Q5 → per-device latest value per field (sorted by field name).
    const valuesByDevice = new Map<string, DeviceFieldValue[]>();
    for (const row of lastValueRows) {
      const device = typeof row.device === 'string' ? row.device : '';
      const field = typeof row._field === 'string' ? row._field : '';
      const value = Number(row._value);
      const time = toTime(row._time);
      if (!device || !field || !time || !Number.isFinite(value)) continue;
      const list = valuesByDevice.get(device) ?? [];
      list.push({ field, value, time });
      valuesByDevice.set(device, list);
    }
    for (const list of valuesByDevice.values()) {
      list.sort((a, b) => a.field.localeCompare(b.field));
    }

    const devices = new Set<string>([
      ...measByDevice.keys(),
      ...sysByDevice.keys(),
      ...realByDevice.keys(),
      ...hbByDevice.keys(),
    ]);

    const result: DeviceStatus[] = [];
    for (const device of devices) {
      const meas = measByDevice.get(device);
      const measurements = meas ? [...meas.measurements].sort() : [];
      const realMeasurements = measurements.filter((m) => m !== 'system');
      const realDataPoints = realByDevice.get(device) ?? 0;
      const lastRealData = meas?.lastReal;
      const sys = sysByDevice.get(device);
      const deviceClass = device.startsWith('vgreens-') ? 'edge' : 'regular';

      const staleAfterMs =
        deviceClass === 'edge'
          ? edgeStaleHours * 3_600_000
          : regularStaleMinutes * 60_000;

      let state: string;
      if (measurements.length === 0) {
        state = 'never-seen';
      } else if (realDataPoints === 0) {
        state = 'heartbeat-only';
      } else if (
        !lastRealData ||
        nowMs - lastRealData.getTime() > staleAfterMs
      ) {
        state = 'stale';
      } else {
        state = 'working';
      }

      result.push({
        device,
        state,
        deviceClass,
        messageTypes: measurements.map(shortMeas),
        realMessageTypes: realMeasurements.map(shortMeas),
        online: sys?.online,
        lastAlive: sys?.lastAlive,
        lastRealData,
        realDataPoints,
        heartbeatDataPoints: hbByDevice.get(device) ?? 0,
        lastValues: valuesByDevice.get(device) ?? [],
      });
    }

    result.sort((a, b) => a.device.localeCompare(b.device));
    this.logger.debug(
      `getDeviceStatusInventory("${bucketName}", start=${options.start}): ${result.length} devices`,
    );
    return result;
  }

  /**
   * Bucketed count of real (non-`system`) data points over the window, for the
   * data-points-over-time chart. `windowEvery` is a Flux duration (e.g. `1h`).
   */
  async getDeviceActivitySeries(
    bucketName: string,
    options: { start: string; stop?: string; windowEvery: string },
  ): Promise<DeviceActivityPoint[]> {
    if (!this.client || !this.queryApi) {
      this.logger.error('InfluxDB client is not initialized');
      throw new Error('InfluxDB client is not initialized');
    }

    const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const rangeClause = this.buildRangeClause(options.start, options.stop);
    // `windowEvery` is internal (never user input) but escape defensively.
    const flux = `from(bucket: "${escape(bucketName)}")
  |> ${rangeClause}
  |> filter(fn: (r) => r["_measurement"] != "system")
  |> group()
  |> aggregateWindow(every: ${escape(options.windowEvery)}, fn: count, column: "_value", createEmpty: true)
  |> keep(columns: ["_time", "_value"])`;

    const rows = await this.runQueryRows(flux);
    const points: DeviceActivityPoint[] = [];
    for (const row of rows) {
      const time =
        row._time instanceof Date
          ? row._time
          : new Date(String((row as { _time?: string })._time ?? ''));
      if (Number.isNaN(time.getTime())) continue;
      const count = Number(row._value);
      points.push({ time, count: Number.isFinite(count) ? count : 0 });
    }
    points.sort((a, b) => a.time.getTime() - b.time.getTime());
    this.logger.debug(
      `getDeviceActivitySeries("${bucketName}", every=${options.windowEvery}): ${points.length} points`,
    );
    return points;
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

/**
 * Tenant-specific correction for `air_*` sensor temperature readings.
 *
 * Formula (per row):
 *   lux_k   = mean(available subset of {lux_03, lux_08})
 *   offset  = max(0, coefA + coefB * lux_k)
 *   adjAir  = rawAir - offset
 *
 * To extend to more tenants/formulas: replace the single `AIR_TEMP_CORRECTION`
 * constant with a Map<bucketName, CorrectionConfig> and thread the config through
 * the helpers (see "How to extend" in the plan doc).
 */

// TODO: replace with the target tenant's influxBucketName (SELECT "influxBucketName" FROM tenants WHERE ...).
const TARGET_BUCKET_NAME = 'knaup_ed458942-f834-4f06-aa21-8d46b5ed8829';

export const AIR_TEMP_CORRECTION = {
  bucketName: TARGET_BUCKET_NAME,
  coefA: -0.47,
  coefB: 0.133,
  // Coefficients are calibrated for lux expressed in kilolux (kLx);
  // raw lux readings from InfluxDB are divided by this before the formula.
  luxToKiloluxDivisor: 1000,
  airDevicePrefix: 'air_',
  luxDevices: ['lux_03', 'lux_08'] as const,
  airFieldName: 'temperature',
  luxFieldName: 'lux',
  defaultMaxAgeMs: 5 * 60 * 1000,
} as const;

export function isTargetBucket(bucketName: string): boolean {
  return bucketName === AIR_TEMP_CORRECTION.bucketName;
}

/**
 * Returns the offset to subtract from a raw air-temperature reading.
 * - Filters lux values to finite numbers ("use whichever is present").
 * - Returns null when no lux value is available — caller must skip correction.
 */
export function computeAirOffset(
  luxValues: ReadonlyArray<number | null | undefined>,
): number | null {
  const present = luxValues.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );
  if (present.length === 0) return null;
  const luxMeanRaw = present.reduce((sum, v) => sum + v, 0) / present.length;
  const luxK = luxMeanRaw / AIR_TEMP_CORRECTION.luxToKiloluxDivisor;
  return Math.max(
    0,
    AIR_TEMP_CORRECTION.coefA + AIR_TEMP_CORRECTION.coefB * luxK,
  );
}

type LuxSample = { time: number; value: number };

function coerceNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function coerceTimeMs(v: unknown): number | null {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === 'string') {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

function getStringTagLower(
  row: Record<string, unknown>,
  key: string,
): string | null {
  const v = row[key];
  return typeof v === 'string' ? v.toLowerCase() : null;
}

function findNearestInWindow(
  sorted: LuxSample[],
  targetTime: number,
  maxAgeMs: number,
): number | null {
  if (sorted.length === 0) return null;
  let nearest: LuxSample | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const s of sorted) {
    const d = Math.abs(s.time - targetTime);
    if (d < bestDist) {
      nearest = s;
      bestDist = d;
    }
  }
  if (!nearest || bestDist > maxAgeMs) return null;
  return nearest.value;
}

/**
 * Mutates `rows` in place: for each air_* temperature row, sets `_rawValue`
 * and (when correction is possible) overwrites `_value` with the corrected
 * reading. Picks the nearest lux_03 / lux_08 sample within `maxAgeMs` of the
 * air row's `_time`. Non-air rows and rows of other `_field`s are untouched.
 *
 * `_rawValue` is set on every matching air_* temperature row (even when
 * correction can't be applied) so consumers have a consistent way to detect
 * "this row participated in the correction pipeline".
 */
export function correctRawRows(
  rows: Record<string, unknown>[],
  opts?: { maxAgeMs?: number; extraLuxRows?: Record<string, unknown>[] },
): void {
  if (rows.length === 0) return;
  const maxAgeMs = opts?.maxAgeMs ?? AIR_TEMP_CORRECTION.defaultMaxAgeMs;

  const luxSamples: Record<string, LuxSample[]> = {};
  for (const id of AIR_TEMP_CORRECTION.luxDevices) luxSamples[id] = [];

  const collectLux = (source: Record<string, unknown>[]) => {
    for (const row of source) {
      const field = getStringTagLower(row, '_field');
      if (field !== AIR_TEMP_CORRECTION.luxFieldName) continue;
      const device = getStringTagLower(row, 'device');
      if (device == null) continue;
      if (
        !(AIR_TEMP_CORRECTION.luxDevices as readonly string[]).includes(device)
      ) {
        continue;
      }
      const time = coerceTimeMs(row._time);
      const value = coerceNumber(row._value);
      if (time == null || value == null) continue;
      luxSamples[device].push({ time, value });
    }
  };
  collectLux(rows);
  if (opts?.extraLuxRows) collectLux(opts.extraLuxRows);
  for (const arr of Object.values(luxSamples)) {
    arr.sort((a, b) => a.time - b.time);
  }

  for (const row of rows) {
    const device = getStringTagLower(row, 'device');
    if (
      device == null ||
      !device.startsWith(AIR_TEMP_CORRECTION.airDevicePrefix)
    ) {
      continue;
    }
    const field = getStringTagLower(row, '_field');
    if (field !== AIR_TEMP_CORRECTION.airFieldName) continue;

    const rawValue = coerceNumber(row._value);
    if (rawValue == null) continue;
    row._rawValue = rawValue;

    const time = coerceTimeMs(row._time);
    if (time == null) continue;

    const [d1, d2] = AIR_TEMP_CORRECTION.luxDevices;
    const luxA = findNearestInWindow(luxSamples[d1], time, maxAgeMs);
    const luxB = findNearestInWindow(luxSamples[d2], time, maxAgeMs);
    const offset = computeAirOffset([luxA, luxB]);
    if (offset != null) {
      row._value = rawValue - offset;
    }
  }
}

/**
 * Minimal shape of a mean row that `correctFieldMeans` needs. Structurally
 * compatible with `FieldMeanMetric` from `bucket-field-means.dto.ts` — kept
 * local so this module stays framework-free.
 */
interface FieldMeanLike {
  field: string;
  value: number;
  rawValue?: number;
}

/**
 * For aggregated means: takes the pre-computed lux_03 / lux_08 mean values
 * for the same window and subtracts the offset from every temperature mean.
 * Sets `rawValue` only when correction is actually applied (matches the
 * `rawValue?: number` schema).
 *
 * Caveat: the existing means query groups by `greenhouse` / `chamber`, so a
 * single global lux mean is applied to every temperature row regardless of
 * its greenhouse. Acceptable for the target tenant where lux is roughly
 * uniform across greenhouses; revisit if that stops being true.
 */
export function correctFieldMeans(
  means: FieldMeanLike[],
  luxMeans: { lux03?: number | null; lux08?: number | null },
): void {
  const offset = computeAirOffset([luxMeans.lux03, luxMeans.lux08]);
  if (offset == null) return;
  for (const mean of means) {
    if (mean.field?.toLowerCase() === AIR_TEMP_CORRECTION.airFieldName) {
      mean.rawValue = mean.value;
      mean.value = mean.value - offset;
    }
  }
}

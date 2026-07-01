/**
 * Shared soil-moisture calibration helpers. The frontend mirrors this exact
 * math in `frontend/src/lib/soil-calibration.ts` — keep the two in sync.
 */

/** InfluxDB `_field` that carries a soil sensor's raw moisture reading. */
export const SOIL_MOISTURE_FIELD = 'soil_moisture';

/**
 * A `sensor_configs.device` is a soil sensor iff its name starts with `Soil_`
 * (case-insensitive) — the established convention (see the frontend
 * `deriveSensorType`). Used to scope the calibration dropdown query.
 */
export const SOIL_DEVICE_REGEX = /^Soil_/i;

/** True once both bounds are set AND distinct (a usable calibration). */
export function isSensorCalibrated(
  avgDryReading?: number | null,
  avgSaturatedReading?: number | null,
): boolean {
  return (
    avgDryReading != null &&
    avgSaturatedReading != null &&
    avgSaturatedReading !== avgDryReading
  );
}

/**
 * Two-point linear map of a raw reading to 0–100% soil moisture:
 *   percent = (raw − dry) / (saturated − dry) × 100
 *
 * Behaviour:
 *  - Either bound null (not yet calibrated) → returns the raw reading
 *    UNCORRECTED, so the farm overview keeps showing a value.
 *  - dry === saturated (degenerate calibration, divide-by-zero) → returns null;
 *    callers should surface a "dry and saturated readings are equal" message.
 *  - Otherwise → the calibrated percentage. NOT clamped to [0, 100]: the
 *    denominator may be negative (inverted sensors) and out-of-range readings
 *    are meaningful signal, not something to hide.
 */
export function computeCorrectedMoisture(
  raw: number,
  avgDryReading?: number | null,
  avgSaturatedReading?: number | null,
): number | null {
  if (avgDryReading == null || avgSaturatedReading == null) {
    return raw;
  }
  if (avgSaturatedReading === avgDryReading) {
    return null;
  }
  return ((raw - avgDryReading) / (avgSaturatedReading - avgDryReading)) * 100;
}

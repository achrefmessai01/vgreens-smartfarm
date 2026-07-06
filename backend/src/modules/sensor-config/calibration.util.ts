/**
 * Shared soil-moisture calibration helpers. The frontend mirrors this exact
 * math in `frontend/src/lib/soil-calibration.ts` — keep the two in sync.
 */

/** InfluxDB `_field` that carries a soil sensor's raw moisture reading. */
export const SOIL_MOISTURE_FIELD = 'soil_moisture';

/**
 * Legacy fallback: a `sensor_configs.device` is a soil sensor iff its name
 * starts with `Soil_` (case-insensitive). Only consulted when the row has no
 * InfluxDB `profile` yet — profile-based detection (`isSoilSensor`) is the
 * source of truth.
 */
export const SOIL_DEVICE_REGEX = /^Soil_/i;

/**
 * Soil-sensor device profiles, exactly as stored in `sensor_configs.profile`
 * (synced from the InfluxDB `profile` tag — the ChirpStack device-profile
 * name). This is the full set observed in production (2026-07-06): all three
 * are Dragino SE01-LB soil moisture & EC probes (`SE01-LB-C` is a calibrated
 * FDR unit). The air/light profiles seen alongside (`S31B`, `S31LB-LB`,
 * `S210X`, `SenseCAP 210x`) are deliberately absent. Matched case-insensitively
 * and exactly — extend the set when new soil hardware is onboarded.
 */
export const SOIL_SENSOR_PROFILES = new Set([
  'dragino-se0x-lb',
  'se01-lb',
  'se01-lb-c',
]);

/** True iff the InfluxDB device profile identifies a soil sensor. */
export function isSoilProfile(profile?: string | null): boolean {
  return (
    profile != null && SOIL_SENSOR_PROFILES.has(profile.trim().toLowerCase())
  );
}

/**
 * Soil-sensor detection: the device profile decides when known; the legacy
 * `Soil_` device-name prefix is the fallback for rows without a profile yet.
 * A known non-soil profile overrides the name — the profile reports what the
 * hardware actually is.
 */
export function isSoilSensor(sensor: {
  device: string;
  profile?: string | null;
}): boolean {
  if (sensor.profile) return isSoilProfile(sensor.profile);
  return SOIL_DEVICE_REGEX.test(sensor.device);
}

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
 *  - Otherwise → the calibrated percentage, clamped to [0, 100]: readings
 *    beyond the calibration bounds (soil drier than the dry capture, wetter
 *    than the saturated one, or bounds captured under the wrong conditions)
 *    must never render as a negative or >100% moisture.
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
  const percent =
    ((raw - avgDryReading) / (avgSaturatedReading - avgDryReading)) * 100;
  return Math.min(100, Math.max(0, percent));
}

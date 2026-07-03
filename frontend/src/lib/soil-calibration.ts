/**
 * Soil-moisture calibration math. Mirror of the backend
 * `sensor-config/calibration.util.ts` — keep the two in sync so the value the
 * farm overview renders matches the server's `correctedValue` resolver.
 */

/** InfluxDB `_field` that carries a soil sensor's raw moisture reading. */
export const SOIL_MOISTURE_FIELD = 'soil_moisture';

/** True once both bounds are set AND distinct (a usable calibration). */
export function isSoilCalibrated(
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
 *  - Either bound null (uncalibrated) → raw reading UNCORRECTED (overview keeps
 *    showing a value).
 *  - dry === saturated (degenerate) → null; the UI surfaces a clear message.
 *  - Otherwise → the calibrated percentage, clamped to [0, 100]: readings
 *    beyond the calibration bounds must never render as negative or >100%.
 */
export function correctedSoilMoisture(
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

/**
 * Allow-listed InfluxDB `_field` names that admins can toggle on/off per tenant
 * via `Tenant.disabledSensorFields`. Mirrors the frontend `VALID_PARAMETERS` in
 * `frontend/src/lib/farm-overview-constants.ts`.
 */
export const ALLOWED_SENSOR_FIELDS = [
  'temperature',
  'humidity',
  'co2',
  'soil_ec',
  'soil_conductivity',
  'soil_moisture',
  'vpd',
  'par',
  'par_estimated',
] as const;

export type AllowedSensorField = (typeof ALLOWED_SENSOR_FIELDS)[number];

export function isAllowedSensorField(
  value: string,
): value is AllowedSensorField {
  return (ALLOWED_SENSOR_FIELDS as readonly string[]).includes(value);
}

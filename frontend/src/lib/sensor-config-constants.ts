/**
 * Sensor configuration field keys and table column order.
 * Labels, hints, and placeholders live in the i18n translation files.
 */

export const SENSOR_CONFIG_FIELD_KEYS = [
  'bay',
  'pole',
  'row',
  'greenhouse',
  'city',
] as const;

export type SensorConfigFieldKey = (typeof SENSOR_CONFIG_FIELD_KEYS)[number];

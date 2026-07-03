import type { ParameterType } from '@/types/farm.types';

/** URL search param keys for farm overview persistence. */
export const PARAM_GREENHOUSE = 'greenhouse';
export const PARAM_PARAMETER = 'parameter';
export const PARAM_VIEW_MODE = 'mode';

/** Keys for greenhouse selector labels (combined, GH1, GH2). */
export const GREENHOUSE_LABEL_KEYS = [
  'combined',
  'greenHouse1',
  'greenHouse2',
] as const;

/**
 * Pseudo-parameter for the Sensor Overview map. Selected like any other
 * parameter tab (temperature, co2, …) but renders the all-sensors map instead
 * of a single-parameter view.
 */
export const SENSOR_OVERVIEW_PARAMETER = 'overview';

/**
 * Sentinel `_field` persisted in `Tenant.disabledSensorFields` when the Sensor
 * Overview tab is toggled OFF in the "Enable Sensors" dropdown. Not a real
 * measurement — see the backend allow-list in `sensor-fields.constants.ts`.
 */
export const SENSOR_OVERVIEW_FIELD = 'sensor_overview';

/** Parameter values allowed in URL; invalid values fall back to temperature. */
export const VALID_PARAMETERS: ParameterType[] = [
  'temperature',
  'humidity',
  'co2',
  // VSL-169: Soil EC stays hidden. VSL-218: Soil moisture re-enabled for
  // sensor calibration. Stale ?parameter=soil_ec falls back to temperature.
  // 'soil_ec',
  'soil_moisture',
  'vpd',
  'par',
  'par_estimated',
  SENSOR_OVERVIEW_PARAMETER,
];

/** View mode values for heatmap / discrete / graph. */
export const VALID_VIEW_MODES = ['heatmap', 'discrete', 'graph'] as const;

export type ViewMode = (typeof VALID_VIEW_MODES)[number];

/**
 * Parameters surfaced as tabs/cards in the farm overview. Matches the set of
 * fields the admin can toggle via "Enable Sensors". Diagnostic fields from the
 * bucket (battery, rssi, missing, …) are excluded.
 */
export const ALLOWED_SINGLE_GREENHOUSE_PARAMETERS: ParameterType[] = [
  'temperature',
  'humidity',
  'co2',
  // VSL-169: Soil EC stays hidden. VSL-218: Soil moisture re-enabled so its
  // calibrated value shows as a parameter tab/card.
  // 'soil_ec',
  // 'soil_conductivity',
  'soil_moisture',
  'vpd',
  'par',
  'par_estimated',
];

/**
 * Logical sensor types exposed by the "Enable Sensors" dropdown. Each entry
 * maps a single user-facing label to one or more InfluxDB `_field` names —
 * `par` and `par_estimated` are tracked separately in Influx but appear as a
 * single "PAR" checkbox here.
 */
export const SENSOR_TYPE_TOGGLES: ReadonlyArray<{
  key: ParameterType;
  fields: ParameterType[];
}> = [
  { key: 'temperature', fields: ['temperature'] },
  { key: 'humidity', fields: ['humidity'] },
  { key: 'co2', fields: ['co2'] },
  // VSL-169: Soil EC toggle stays hidden. VSL-218: Soil moisture toggle
  // re-enabled so admins can show/hide calibrated moisture.
  // { key: 'soil_ec', fields: ['soil_ec', 'soil_conductivity'] },
  { key: 'soil_moisture', fields: ['soil_moisture'] },
  { key: 'vpd', fields: ['vpd'] },
  { key: 'par', fields: ['par', 'par_estimated'] },
];

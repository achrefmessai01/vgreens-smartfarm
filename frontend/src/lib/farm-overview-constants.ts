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

/** Parameter values allowed in URL; invalid values fall back to temperature. */
export const VALID_PARAMETERS: ParameterType[] = [
  'temperature',
  'humidity',
  'co2',
  'soil_ec',
  'soil_moisture',
  'vpd',
  'par',
  'par_estimated',
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
  'soil_ec',
  'soil_conductivity',
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
  { key: 'soil_ec', fields: ['soil_ec', 'soil_conductivity'] },
  { key: 'soil_moisture', fields: ['soil_moisture'] },
  { key: 'vpd', fields: ['vpd'] },
  { key: 'par', fields: ['par', 'par_estimated'] },
];

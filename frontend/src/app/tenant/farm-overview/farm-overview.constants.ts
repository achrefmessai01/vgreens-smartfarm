/**
 * Constants for farm overview URL persistence and options.
 */

import type { ParameterType } from '@/lib/farm-types';

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

/** Parameters shown in single-greenhouse view (not combined). */
export const ALLOWED_SINGLE_GREENHOUSE_PARAMETERS: ParameterType[] = [
  'temperature',
  'humidity',
  'vpd',
  'par',
  'par_estimated',
];

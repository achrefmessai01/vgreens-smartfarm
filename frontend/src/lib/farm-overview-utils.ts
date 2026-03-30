import type { ParameterType } from '@/types/farm.types';
import {
  PARAM_GREENHOUSE,
  PARAM_PARAMETER,
  PARAM_VIEW_MODE,
  VALID_PARAMETERS,
  VALID_VIEW_MODES,
  type ViewMode,
} from '@/lib/farm-overview-constants';

/** Parse greenhouse URL value to tab index (0 = combined, 1 = GH1, 2 = GH2). */
export function parseGreenhouseTab(value: string | null): number {
  if (value === 'combined' || value === '0') return 0;
  if (value === '1') return 1;
  if (value === '2') return 2;
  return 0;
}

/** Parse parameter URL value; returns default temperature if invalid. */
export function parseParameter(value: string | null): ParameterType {
  if (!value) return 'temperature';
  return VALID_PARAMETERS.includes(value as ParameterType)
    ? (value as ParameterType)
    : 'temperature';
}

/** Parse view mode URL value; returns default discrete if invalid. */
export function parseViewMode(value: string | null): ViewMode {
  if (value && VALID_VIEW_MODES.includes(value as ViewMode))
    return value as ViewMode;
  return 'discrete';
}

/**
 * Update the current URL with farm overview state (greenhouse, parameter, mode).
 * Preserves existing search params (e.g. tenantId).
 */
export function syncFarmOverviewStateToUrl(
  tab: number,
  parameter: ParameterType,
  mode: string,
): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM_GREENHOUSE, tab === 0 ? 'combined' : String(tab));
  url.searchParams.set(PARAM_PARAMETER, parameter);
  url.searchParams.set(PARAM_VIEW_MODE, mode);
  window.history.replaceState({}, '', url.toString());
}

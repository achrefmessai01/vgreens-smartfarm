import type { Bay, ParameterType } from '@/types/farm.types';
import {
  PARAM_GREENHOUSE,
  PARAM_PARAMETER,
  PARAM_VIEW_MODE,
  VALID_PARAMETERS,
  VALID_VIEW_MODES,
  type ViewMode,
} from '@/lib/farm-overview-constants';

/** Trailing-number normaliser ("greenhouse_03" → 3, "Haus 3" → 3). */
function trailingNumber(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /(\d+)\s*$/.exec(s);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Find the bay backing a given tenant greenhouse, falling back through several
 * heuristics. Bays are constructed by `influxRowsToBays` keyed on
 * `SensorConfig.greenhouse ?? influxGreenhouseTag` — so a bay's `name` may be
 * the operator-assigned display name (e.g. "Haus 3"), the raw InfluxDB tag
 * (e.g. "greenhouse_03"), or — if mixed — both. Matching strictly by `===`
 * misses raw-tag bays that should belong to a display-named greenhouse.
 *
 * Order:
 *   1. Exact name match
 *   2. Case/whitespace-insensitive name match
 *   3. Trailing-number match (e.g. "Haus 3" ↔ "greenhouse_03" ↔ "chamber_3")
 */
export function findBayForGreenhouse(
  bays: Bay[],
  greenhouseName: string,
  greenhouseIndex: number,
): Bay | null {
  if (!greenhouseName) return null;

  const exact = bays.find((b) => b.name === greenhouseName);
  if (exact) return exact;

  const target = greenhouseName.toLowerCase().trim();
  const ci = bays.find((b) => b.name?.toLowerCase().trim() === target);
  if (ci) return ci;

  const wantNum =
    trailingNumber(greenhouseName) ?? (greenhouseIndex >= 0 ? greenhouseIndex + 1 : null);
  if (wantNum != null) {
    const byNumber = bays.find((b) => trailingNumber(b.name) === wantNum);
    if (byNumber) return byNumber;
  }

  return null;
}

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

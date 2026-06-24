import type { Bay, ParameterType } from '@/types/farm.types';
import type { SensorConfigOverride } from '@/lib/farm-data-live';
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

/** Collect distinct device ids contained in a bay's slots, using the raw
 *  device from slot meta (slot ids are whitespace-normalised and lossy). */
function collectBayDevices(bay: Bay): string[] {
  const set = new Set<string>();
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        const device = (slot.meta as { device?: unknown } | undefined)?.device;
        if (typeof device === 'string' && device) set.add(device);
      }
    }
  }
  return Array.from(set);
}

export interface FindBayOptions {
  /** Total greenhouses on the tenant — enables the positional-equality
   *  fallback (i-th greenhouse ↔ i-th bay) when no name-based strategy hits. */
  totalGreenhouses?: number;
  /** Persisted SensorConfig overrides keyed by device id. Used to claim a bay
   *  for a greenhouse when any of the bay's devices is explicitly assigned to
   *  it, even if the bay's name is a raw Influx tag like "greenhouse_01". */
  sensorConfigMap?: Map<string, SensorConfigOverride>;
}

/**
 * Find the bay backing a given tenant greenhouse, falling back through several
 * heuristics. Bays are constructed by `influxRowsToBays` keyed on
 * `SensorConfig.greenhouse ?? influxGreenhouseTag` — so a bay's `name` may be
 * the operator-assigned display name (e.g. "Haus 3"), the raw InfluxDB tag
 * (e.g. "greenhouse_03"), or — for tenants whose tags don't end in a digit —
 * something arbitrary like "rhodium_tunnel". Matching strictly by `===`
 * misses every bay whose name doesn't structurally resemble the display name.
 *
 * Order (each strategy is non-destructive — falls through if it doesn't hit):
 *   1. Exact name match
 *   2. Case/whitespace-insensitive name match
 *   3. SensorConfig device-linkage — any bay whose device is explicitly
 *      assigned to this greenhouse via a persisted override claims the bay.
 *   4. Case-insensitive substring match (handles "Rhodium" ↔ "greenhouse_rhodium")
 *   5. Trailing-number match (e.g. "Haus 3" ↔ "greenhouse_03" ↔ "chamber_3"),
 *      falling back to `greenhouseIndex + 1` when the name itself has no digit.
 *   6. Positional fallback when total greenhouse count equals total bay count.
 *   7. Singleton fallback (one bay, one greenhouse) — claim it.
 */
export function findBayForGreenhouse(
  bays: Bay[],
  greenhouseName: string,
  greenhouseIndex: number,
  options?: FindBayOptions,
): Bay | null {
  if (!greenhouseName || bays.length === 0) return null;

  // 1. Exact name match
  const exact = bays.find((b) => b.name === greenhouseName);
  if (exact) return exact;

  // 2. Case/whitespace-insensitive name match
  const target = greenhouseName.toLowerCase().trim();
  const ci = bays.find((b) => b.name?.toLowerCase().trim() === target);
  if (ci) return ci;

  // 3. SensorConfig device-linkage. Useful when an operator has assigned a
  //    sensor to "Rhodium" in the UI but the bay still surfaces under its raw
  //    Influx tag (e.g. because most other devices in the same bay have no
  //    saved override).
  const sensorConfigMap = options?.sensorConfigMap;
  if (sensorConfigMap && sensorConfigMap.size > 0) {
    for (const bay of bays) {
      const devices = collectBayDevices(bay);
      for (const device of devices) {
        const cfg = sensorConfigMap.get(device);
        const assigned = cfg?.greenhouse?.toLowerCase().trim();
        if (assigned && assigned === target) return bay;
      }
    }
  }

  // 4. Case-insensitive substring match (handles bay names that contain the
  //    greenhouse name as a part, like "greenhouse_rhodium" or "rhodium_01").
  const substring = bays.find((b) => {
    const name = b.name?.toLowerCase().trim();
    if (!name) return false;
    return name.includes(target) || target.includes(name);
  });
  if (substring) return substring;

  // 5. Trailing-number match.
  const wantNum =
    trailingNumber(greenhouseName) ??
    (greenhouseIndex >= 0 ? greenhouseIndex + 1 : null);
  if (wantNum != null) {
    const byNumber = bays.find((b) => trailingNumber(b.name) === wantNum);
    if (byNumber) return byNumber;
  }

  // 6. Positional fallback. When the tenant has the same number of bays as
  //    greenhouses, pair the i-th greenhouse with the i-th bay (sorted
  //    alphabetically by chamber name). This is the last-resort 1:1 mapping
  //    for tenants whose Influx tags bear no relation to the display names.
  if (
    options?.totalGreenhouses != null &&
    options.totalGreenhouses === bays.length &&
    greenhouseIndex >= 0 &&
    greenhouseIndex < bays.length
  ) {
    return bays[greenhouseIndex];
  }

  // 7. Singleton fallback. One bay, one greenhouse → claim it. The check on
  //    totalGreenhouses keeps this from over-claiming a sole bay for several
  //    greenhouses.
  if (
    bays.length === 1 &&
    (options?.totalGreenhouses == null || options.totalGreenhouses === 1)
  ) {
    return bays[0];
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

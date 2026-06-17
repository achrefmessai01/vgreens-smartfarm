// Pure, framework-agnostic state + transforms for the harvest-entry view's
// sort + plantingDate-range controls. Kept free of React/Apollo so the logic
// can be unit-tested in isolation (see harvest-view-settings.test.ts). The
// persistence hook and presentational components build on top of this.

// String-union mirrors of the backend GraphQL enums (HarvestSortField,
// OrderDirection). Values match the enum strings exactly, so they can be sent
// as query/mutation variables without translation.
export type HarvestSortField = 'CROP' | 'GREENHOUSE' | 'PLANTING_DATE';
export type SortDirection = 'ASC' | 'DESC';

export interface HarvestSort {
  field: HarvestSortField;
  direction: SortDirection;
}

// Inclusive plantingDate bounds as YYYY-MM-DD strings; null = open-ended.
export interface HarvestDateRange {
  from: string | null;
  to: string | null;
}

export interface HarvestViewState {
  sort: HarvestSort;
  dateRange: HarvestDateRange;
}

// Order the sort buttons render in.
export const SORT_FIELDS: readonly HarvestSortField[] = [
  'PLANTING_DATE',
  'CROP',
  'GREENHOUSE',
];

// Used when the user has no persisted preference (userSettings null/missing):
// newest planting first, no date filter.
export const DEFAULT_HARVEST_VIEW: HarvestViewState = {
  sort: { field: 'PLANTING_DATE', direction: 'DESC' },
  dateRange: { from: null, to: null },
};

const SORT_FIELD_SET = new Set<string>(SORT_FIELDS);
const DIRECTION_SET = new Set<string>(['ASC', 'DESC']);

// A persisted harvestView blob from `me.userSettings` — loosely typed because
// it crosses the network and may be partial / from an older client.
export interface PersistedHarvestView {
  sort?: { field?: string | null; direction?: string | null } | null;
  dateRange?: { from?: string | null; to?: string | null } | null;
}

/**
 * Normalize a persisted harvestView (or null) into a fully-populated state,
 * substituting defaults for any missing/invalid piece. Never throws.
 */
export function parseHarvestView(
  persisted: PersistedHarvestView | null | undefined,
): HarvestViewState {
  const field = persisted?.sort?.field;
  const direction = persisted?.sort?.direction;
  const sort: HarvestSort =
    field &&
    SORT_FIELD_SET.has(field) &&
    direction &&
    DIRECTION_SET.has(direction)
      ? {
          field: field as HarvestSortField,
          direction: direction as SortDirection,
        }
      : { ...DEFAULT_HARVEST_VIEW.sort };

  return {
    sort,
    dateRange: {
      from: persisted?.dateRange?.from ?? null,
      to: persisted?.dateRange?.to ?? null,
    },
  };
}

/** YYYY-MM-DD strings compare correctly with `<=`. Open bounds are always ok. */
export function isValidRange(range: HarvestDateRange): boolean {
  if (!range.from || !range.to) return true;
  return range.from <= range.to;
}

/**
 * Toggle/select a sort field. Selecting a different field starts ascending;
 * clicking the already-active field flips its direction. Only ever one active
 * field (single sort), satisfying the single-active-sort requirement.
 */
export function cycleSort(
  state: HarvestViewState,
  field: HarvestSortField,
): HarvestViewState {
  if (state.sort.field !== field) {
    return { ...state, sort: { field, direction: 'ASC' } };
  }
  return {
    ...state,
    sort: {
      field,
      direction: state.sort.direction === 'ASC' ? 'DESC' : 'ASC',
    },
  };
}

/** Replace one or both date bounds; empty-string inputs normalize to null. */
export function setDateRange(
  state: HarvestViewState,
  patch: Partial<HarvestDateRange>,
): HarvestViewState {
  const norm = (v: string | null | undefined, fallback: string | null) =>
    v === undefined ? fallback : v === '' ? null : v;
  return {
    ...state,
    dateRange: {
      from: norm(patch.from, state.dateRange.from),
      to: norm(patch.to, state.dateRange.to),
    },
  };
}

/**
 * Variables for the `Batches` query. The date range is only sent when at least
 * one bound is set (and the range is valid); an invalid range is dropped so the
 * server isn't asked for an impossible window.
 */
export function toBatchesVariables(state: HarvestViewState): {
  filter?: { plantingDateFrom?: string; plantingDateTo?: string };
  sort: HarvestSort;
} {
  const { from, to } = state.dateRange;
  const hasRange = (from || to) && isValidRange(state.dateRange);
  return {
    sort: state.sort,
    filter: hasRange
      ? {
          ...(from ? { plantingDateFrom: from } : {}),
          ...(to ? { plantingDateTo: to } : {}),
        }
      : undefined,
  };
}

/** Input payload for the `updateMyHarvestViewSettings` mutation. */
export function toSettingsInput(state: HarvestViewState): {
  sort: HarvestSort;
  dateRange: HarvestDateRange;
} {
  return { sort: state.sort, dateRange: state.dateRange };
}

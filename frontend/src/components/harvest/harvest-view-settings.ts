// Framework-agnostic state + transforms for the harvest-entry view's sort +
// plantingDate-range controls. Types come from the generated GraphQL enums so
// the values flow straight into query/mutation variables without translation.

import {
  HarvestSortField,
  OrderDirection,
  HarvestDateRangePreset,
} from '@/generated/graphql';

export { HarvestSortField, OrderDirection, HarvestDateRangePreset };

export interface HarvestSort {
  field: HarvestSortField;
  direction: OrderDirection;
}

export interface HarvestViewState {
  sort: HarvestSort;
  range: HarvestDateRangePreset;
}

// Order the range presets render in the dropdown (chronological, broad last).
export const RANGE_PRESETS: readonly HarvestDateRangePreset[] = [
  HarvestDateRangePreset.Today,
  HarvestDateRangePreset.ThisWeek,
  HarvestDateRangePreset.ThisMonth,
  HarvestDateRangePreset.LastMonth,
  HarvestDateRangePreset.ThisYear,
  HarvestDateRangePreset.All,
];

// Used when the user has no persisted preference (userSettings null/missing):
// newest planting first, no date filter.
export const DEFAULT_HARVEST_VIEW: HarvestViewState = {
  sort: {
    field: HarvestSortField.PlantingDate,
    direction: OrderDirection.Desc,
  },
  range: HarvestDateRangePreset.All,
};

const SORT_FIELD_VALUES = new Set<string>(Object.values(HarvestSortField));
const DIRECTION_VALUES = new Set<string>(Object.values(OrderDirection));
const RANGE_VALUES = new Set<string>(Object.values(HarvestDateRangePreset));

// A persisted harvestView blob from `me.userSettings` — loosely typed because
// it crosses the network and may be partial / from an older client.
export interface PersistedHarvestView {
  sort?: { field?: string | null; direction?: string | null } | null;
  range?: string | null;
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
    SORT_FIELD_VALUES.has(field) &&
    direction &&
    DIRECTION_VALUES.has(direction)
      ? {
          field: field as HarvestSortField,
          direction: direction as OrderDirection,
        }
      : { ...DEFAULT_HARVEST_VIEW.sort };

  const range =
    persisted?.range && RANGE_VALUES.has(persisted.range)
      ? (persisted.range as HarvestDateRangePreset)
      : DEFAULT_HARVEST_VIEW.range;

  return { sort, range };
}

/** Replace the active sort. */
export function setSort(
  state: HarvestViewState,
  sort: HarvestSort,
): HarvestViewState {
  return { ...state, sort };
}

/** Replace the active range preset. */
export function setRange(
  state: HarvestViewState,
  range: HarvestDateRangePreset,
): HarvestViewState {
  return { ...state, range };
}

/** Local YYYY-MM-DD (no timezone shift), matching the dashboard's date logic. */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Resolve a preset to an inclusive plantingDate range. `All` returns no bounds.
 * `now` is injectable for determinism; defaults to the current date.
 */
export function resolveRangeBounds(
  preset: HarvestDateRangePreset,
  now: Date = new Date(),
): { from?: string; to?: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayISO = toISODate(today);

  switch (preset) {
    case HarvestDateRangePreset.All:
      return {};
    case HarvestDateRangePreset.Today:
      return { from: todayISO, to: todayISO };
    case HarvestDateRangePreset.ThisWeek: {
      // Week starts Monday.
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const start = new Date(today);
      start.setDate(today.getDate() - daysToSubtract);
      return { from: toISODate(start), to: todayISO };
    }
    case HarvestDateRangePreset.ThisMonth: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toISODate(start), to: todayISO };
    }
    case HarvestDateRangePreset.LastMonth: {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toISODate(start), to: toISODate(end) };
    }
    case HarvestDateRangePreset.ThisYear: {
      const start = new Date(today.getFullYear(), 0, 1);
      return { from: toISODate(start), to: todayISO };
    }
  }
}

/**
 * Variables for the `Batches` query: the sort selection plus the resolved
 * plantingDate bounds for the active preset (omitted entirely for `All`).
 */
export function toBatchesVariables(
  state: HarvestViewState,
  now?: Date,
): {
  filter?: { plantingDateFrom?: string; plantingDateTo?: string };
  sort: HarvestSort;
} {
  const { from, to } = resolveRangeBounds(state.range, now);
  const hasRange = Boolean(from || to);
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
  range: HarvestDateRangePreset;
} {
  return { sort: state.sort, range: state.range };
}

'use client';

import * as React from 'react';
import {
  useMeQuery,
  useSetMyFarmOverviewTimeRangeMutation,
} from '@/generated/graphql';

export const TIME_RANGE_PRESETS = [
  '5m',
  '1h',
  '24h',
  '7d',
  '30d',
  '90d',
  'ytd',
] as const;
export type TimeRangePreset = (typeof TIME_RANGE_PRESETS)[number];

export interface CustomTimeRange {
  kind: 'custom';
  from: Date;
  to: Date;
}

export interface PresetTimeRange {
  kind: 'preset';
  preset: TimeRangePreset;
}

export type TimeRangeValue = PresetTimeRange | CustomTimeRange;

export const DEFAULT_TIME_RANGE_PRESET: TimeRangePreset = '5m';

const PRESET_SET = new Set<string>(TIME_RANGE_PRESETS);

/**
 * Convert a `TimeRangeValue` to the absolute (start, stop) ISO pair we send
 * to InfluxDB. Presets are resolved against "now" each call, so callers
 * should memoize based on the stable serialized form when needed.
 */
export function resolveAbsoluteRange(range: TimeRangeValue): {
  start: string;
  stop: string;
} {
  if (range.kind === 'custom') {
    return { start: range.from.toISOString(), stop: range.to.toISOString() };
  }
  const now = new Date();
  const stop = now.toISOString();
  let start: Date;
  switch (range.preset) {
    case '5m':
      start = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'ytd':
      start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      break;
  }
  return { start: start.toISOString(), stop };
}

/**
 * Number of minutes covered by a `TimeRangeValue`. Used to pick a sensible
 * `windowMinutes` for the backend's fallback path (legacy clients hitting
 * `getBucketFieldMeansLastMinutes` without absolute start/stop still need
 * a minute count, and clamping to ≥1 avoids a Flux error).
 */
export function approximateWindowMinutes(range: TimeRangeValue): number {
  const { start, stop } = resolveAbsoluteRange(range);
  const minutes = Math.round(
    (new Date(stop).getTime() - new Date(start).getTime()) / 60_000,
  );
  return Math.max(1, minutes);
}

/** Stable string form for caching/equality. */
export function serializeTimeRange(range: TimeRangeValue): string {
  if (range.kind === 'preset') return range.preset;
  return `custom:${range.from.toISOString()}|${range.to.toISOString()}`;
}

/**
 * Parse the wire-format string the backend stores. Returns null for
 * invalid input so callers can fall back to the default.
 */
export function parseTimeRange(
  value: string | null | undefined,
): TimeRangeValue | null {
  if (!value) return null;
  if (PRESET_SET.has(value)) {
    return { kind: 'preset', preset: value as TimeRangePreset };
  }
  if (value.startsWith('custom:')) {
    const body = value.slice('custom:'.length);
    const pipeIdx = body.indexOf('|');
    if (pipeIdx <= 0) return null;
    const from = new Date(body.slice(0, pipeIdx));
    const to = new Date(body.slice(pipeIdx + 1));
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
    if (from >= to) return null;
    return { kind: 'custom', from, to };
  }
  return null;
}

const DEFAULT_RANGE: TimeRangeValue = {
  kind: 'preset',
  preset: DEFAULT_TIME_RANGE_PRESET,
};

/**
 * Persists the user's farm-overview time-range selection. Mirrors the
 * `setMyLanguage` pattern: read from `me`, write via mutation, optimistic
 * cache update so the UI stays in sync without refetching `me`.
 */
export function useFarmOverviewTimeRange() {
  const { data, loading } = useMeQuery({ fetchPolicy: 'cache-first' });
  const persistedValue = data?.me?.farmOverviewTimeRange ?? null;
  const userId = data?.me?.id ?? null;

  const value = React.useMemo<TimeRangeValue>(
    () => parseTimeRange(persistedValue) ?? DEFAULT_RANGE,
    [persistedValue],
  );

  const [mutate] = useSetMyFarmOverviewTimeRangeMutation();

  const setValue = React.useCallback(
    (next: TimeRangeValue) => {
      const serialized = serializeTimeRange(next);
      if (!userId) return;
      void mutate({
        variables: { value: serialized },
        optimisticResponse: {
          __typename: 'Mutation',
          setMyFarmOverviewTimeRange: {
            __typename: 'User',
            id: userId,
            farmOverviewTimeRange: serialized,
          },
        },
        update: (cache, result) => {
          const updated = result.data?.setMyFarmOverviewTimeRange;
          if (!updated) return;
          cache.modify({
            id: cache.identify({ __typename: 'User', id: updated.id }),
            fields: {
              farmOverviewTimeRange: () => updated.farmOverviewTimeRange,
            },
          });
        },
      }).catch((err) => {
        console.warn('[farm-overview] setMyFarmOverviewTimeRange failed', err);
      });
    },
    [mutate, userId],
  );

  return { value, setValue, loading };
}

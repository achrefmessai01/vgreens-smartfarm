'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { DateFilter } from './use-harvest-dashboard';

const VALID_PERIODS: ReadonlySet<DateFilter> = new Set<DateFilter>([
  'today',
  'thisWeek',
  'lastWeek',
  'thisMonth',
  'lastMonth',
  'total',
]);

export const ALL_BATCHES = '__all__';
export const MAX_COMPARE_BATCHES = 10;

export interface HarvestDashboardUrlState {
  period: DateFilter;
  batchId: string | undefined;
  compareBatchIds: string[];
  compareMode: boolean;
  setPeriod: (period: DateFilter) => void;
  setCompareBatchIds: (ids: string[]) => void;
}

function parseCompareParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_COMPARE_BATCHES);
}

export function useHarvestDashboardUrlState(): HarvestDashboardUrlState {
  const router = useRouter();
  const searchParams = useSearchParams();

  const period = useMemo<DateFilter>(() => {
    const raw = searchParams.get('period') as DateFilter | null;
    return raw && VALID_PERIODS.has(raw) ? raw : 'thisMonth';
  }, [searchParams]);

  const compareParam = searchParams.get('compare');
  const compareBatchIds = useMemo(
    () => parseCompareParam(compareParam),
    [compareParam],
  );

  const batchId =
    compareBatchIds.length === 1 ? compareBatchIds[0] : undefined;
  const compareMode = compareBatchIds.length >= 2;

  const writeParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setPeriod = useCallback(
    (next: DateFilter) => {
      writeParams((params) => {
        if (next === 'thisMonth') params.delete('period');
        else params.set('period', next);
      });
    },
    [writeParams],
  );

  const setCompareBatchIds = useCallback(
    (ids: string[]) => {
      const capped = ids.slice(0, MAX_COMPARE_BATCHES);
      writeParams((params) => {
        if (capped.length === 0) params.delete('compare');
        else params.set('compare', capped.join(','));
      });
    },
    [writeParams],
  );

  return {
    period,
    batchId,
    compareBatchIds,
    compareMode,
    setPeriod,
    setCompareBatchIds,
  };
}

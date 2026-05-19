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
export const MAX_COMPARE_BATCHES = 4;

export interface HarvestDashboardUrlState {
  period: DateFilter;
  batchId: string | undefined;
  compareBatchIds: string[];
  compareMode: boolean;
  setPeriod: (period: DateFilter) => void;
  setBatchId: (batchId: string | undefined) => void;
  setCompareBatchIds: (ids: string[]) => void;
  enterCompareMode: (seed?: string) => void;
  exitCompareMode: () => void;
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

  const batchIdParam = searchParams.get('batch');
  const batchId =
    batchIdParam && batchIdParam !== ALL_BATCHES ? batchIdParam : undefined;

  const compareParam = searchParams.get('compare');
  const compareBatchIds = useMemo(
    () => parseCompareParam(compareParam),
    [compareParam],
  );
  const compareMode = compareParam !== null;

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

  const setBatchId = useCallback(
    (next: string | undefined) => {
      writeParams((params) => {
        if (!next || next === ALL_BATCHES) params.delete('batch');
        else params.set('batch', next);
      });
    },
    [writeParams],
  );

  const setCompareBatchIds = useCallback(
    (ids: string[]) => {
      const capped = ids.slice(0, MAX_COMPARE_BATCHES);
      writeParams((params) => {
        params.set('compare', capped.join(','));
      });
    },
    [writeParams],
  );

  const enterCompareMode = useCallback(
    (seed?: string) => {
      writeParams((params) => {
        const seeds: string[] = [];
        const current = parseCompareParam(params.get('compare'));
        if (current.length > 0) seeds.push(...current);
        const existingSingle = params.get('batch');
        if (
          existingSingle &&
          existingSingle !== ALL_BATCHES &&
          !seeds.includes(existingSingle)
        ) {
          seeds.push(existingSingle);
        }
        if (seed && !seeds.includes(seed)) seeds.push(seed);
        params.set('compare', seeds.slice(0, MAX_COMPARE_BATCHES).join(','));
        params.delete('batch');
      });
    },
    [writeParams],
  );

  const exitCompareMode = useCallback(() => {
    writeParams((params) => {
      params.delete('compare');
    });
  }, [writeParams]);

  return {
    period,
    batchId,
    compareBatchIds,
    compareMode,
    setPeriod,
    setBatchId,
    setCompareBatchIds,
    enterCompareMode,
    exitCompareMode,
  };
}

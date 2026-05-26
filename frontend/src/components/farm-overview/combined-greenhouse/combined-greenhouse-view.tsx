'use client';

import * as React from 'react';
import {
  type ParameterOption,
  GreenhouseSummaryCard,
} from './greenhouse-summary-card';
import { Card } from '@/components/ui/card';
import type { Bay } from '@/types/farm.types';
import {
  PARAMETER_PRIORITY,
  getParameterAliases,
} from '@/lib/parameter-status';
import { ParGraphSection } from '@/components/farm-overview';
import {
  useGetBucketFieldMeansLastMinutesQuery,
  useMeQuery,
} from '@/generated/graphql';
import {
  approximateWindowMinutes,
  resolveAbsoluteRange,
  serializeTimeRange,
  useFarmOverviewTimeRange,
} from '@/lib/hooks/use-farm-overview-time-range';

export interface CombinedGreenhouse {
  key: string;
  label: string;
  bay: Bay | null;
}

export interface CombinedGreenhouseViewProps {
  greenhouses: CombinedGreenhouse[];
  parameters: ParameterOption[];
  noDataMessage: string;
  parGraphLabel: string;
  /** Optional bucket override forwarded to the embedded field-means query
   *  (used to populate per-greenhouse parameter cards). Required when a
   *  vGreens admin views another tenant. */
  parGraphBucketName?: string | null;
  /** Optional tenant override forwarded to the PAR graph. Required when a
   *  vGreens admin views another tenant; tenant users can omit it. */
  parGraphTenantId?: string | null;
  onParameterClick?: (greenhouseIndex: number, parameterKey: string) => void;
}

/**
 * Bring an Influx location tag (`greenhouse` or `chamber`) into the same
 * shape as `bay.name`, which is parsed out of a `slot.id` that has had
 * whitespace replaced with `_`. We additionally lowercase to make the
 * candidate match against the canonical `greenhouse_NN` form case-
 * insensitive.
 */
function normalizeLocationKey(raw: string): string {
  // `slot.id` uses `replace(/\s/g, '_')` — one `_` per whitespace char,
  // not `/\s+/g`. Lowercasing on top so "Greenhouse_1" lines up with the
  // canonical lowercase `greenhouse_NN` form when present.
  return raw.replace(/\s/g, '_').toLowerCase();
}

/**
 * Every candidate key we'll try when looking the bay up in the means
 * map. Real tenants use any of:
 *   - the user-facing display name verbatim ("Raspberry_Tunnels")
 *   - the canonical Influx tag ("greenhouse_01", chambers similar)
 *   - sometimes both, but with different casing or zero-padding
 * Trying each form per bay makes the lookup robust without forcing the
 * tenant to align their naming.
 */
function candidateLocationKeys(bay: Bay | null): string[] {
  if (!bay) return [];
  const out: string[] = [];
  if (bay.name) out.push(normalizeLocationKey(bay.name));
  if (typeof bay.index === 'number' && bay.index >= 0) {
    const padded = String(bay.index + 1).padStart(2, '0');
    out.push(`greenhouse_${padded}`);
    out.push(`chamber_${padded}`);
    // Unpadded variants too, since some tenants tag without leading zero.
    out.push(`greenhouse_${bay.index + 1}`);
    out.push(`chamber_${bay.index + 1}`);
  }
  return out;
}

function orderParameters(parameters: ParameterOption[]): ParameterOption[] {
  const uniqueByValue = new Map<string, ParameterOption>();
  for (const option of parameters) {
    if (!uniqueByValue.has(option.value))
      uniqueByValue.set(option.value, option);
  }
  const priorityByField = new Map(
    PARAMETER_PRIORITY.map((field, i) => [field, i]),
  );
  return Array.from(uniqueByValue.values()).sort((a, b) => {
    const aP = priorityByField.get(a.value) ?? Number.MAX_SAFE_INTEGER;
    const bP = priorityByField.get(b.value) ?? Number.MAX_SAFE_INTEGER;
    if (aP !== bP) return aP - bP;
    return a.label.localeCompare(b.label);
  });
}

export function CombinedGreenhouseView({
  greenhouses,
  parameters,
  noDataMessage,
  parGraphLabel,
  parGraphBucketName,
  parGraphTenantId,
  onParameterClick,
}: CombinedGreenhouseViewProps) {
  const orderedParameters = React.useMemo(
    () => orderParameters(parameters),
    [parameters],
  );

  // The selector lives in the page header now and writes through the same
  // hook; here we just read the persisted value so the means query refetches
  // when the user changes the range.
  const { value: timeRange } = useFarmOverviewTimeRange();
  const serializedRange = serializeTimeRange(timeRange);

  // Re-resolve absolute start/stop whenever the range changes. For preset
  // ranges these depend on "now", so the memo key is the serialized form —
  // we accept up to one render of staleness as users change presets.
  const { start, stop, windowMinutes } = React.useMemo(() => {
    const abs = resolveAbsoluteRange(timeRange);
    return {
      start: abs.start,
      stop: abs.stop,
      windowMinutes: approximateWindowMinutes(timeRange),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedRange]);

  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-first' });
  const bucketName =
    parGraphBucketName ?? meData?.me?.tenant?.influxBucketName ?? null;

  const { data: meansData } = useGetBucketFieldMeansLastMinutesQuery({
    variables: {
      input: {
        bucketName: bucketName ?? '',
        start,
        stop,
        windowMinutes,
      },
    },
    skip: !bucketName,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  /**
   * `Map<normalizedLocation, Map<fieldName, mean>>` built once per fetch.
   * Keys are normalized via `normalizeLocationKey` so they line up with
   * `bay.name`, which is derived from `slot.id` after whitespace has been
   * replaced with `_` (see `farm-data-live.ts > buildSlotsFromRows`).
   * Without this normalization, a tenant whose Influx tag is e.g.
   * "Greenhouse 1" would never match `bay.name === "Greenhouse_1"`.
   * The location source is whichever of `greenhouse` / `chamber` the
   * Flux row carries (different tenants tag with different keys).
   */
  const meansByLocationField = React.useMemo(() => {
    const root = new Map<string, Map<string, number>>();
    const rows = meansData?.getBucketFieldMeansLastMinutes ?? [];
    for (const row of rows) {
      const rawLocation = row.greenhouse || row.chamber;
      if (!rawLocation) continue;
      const key = normalizeLocationKey(rawLocation);
      let inner = root.get(key);
      if (!inner) {
        inner = new Map();
        root.set(key, inner);
      }
      inner.set(row.field, row.value);
    }
    return root;
  }, [meansData]);

  // Dev-only diagnostic: warns once per (response, bay-set) change if no
  // bay produced a candidate key matching any returned location. Helpful
  // when a tenant introduces yet another tagging convention.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (meansByLocationField.size === 0) return;
    const bays = greenhouses.map((g) => g.bay).filter((b): b is Bay => !!b);
    if (bays.length === 0) return;
    const meansKeys = Array.from(meansByLocationField.keys());
    const anyMatch = bays.some((bay) =>
      candidateLocationKeys(bay).some((k) => meansByLocationField.has(k)),
    );
    if (!anyMatch) {
      console.warn(
        '[CombinedGreenhouseView] None of the bays produced a candidate ' +
          'key matching any returned greenhouse/chamber tag. Means will ' +
          'silently fall back to the spatial snapshot.',
        {
          baysTried: bays.map((b) => ({
            name: b.name,
            index: b.index,
            candidates: candidateLocationKeys(b),
          })),
          meansKeys,
        },
      );
    }
  }, [greenhouses, meansByLocationField]);

  /**
   * PAR sensors are typically installed once per site, not once per
   * greenhouse, so the original combined view force-shared the PAR value
   * across cards. Preserve that: for PAR-like fields we accept the first
   * non-null mean from any greenhouse.
   */
  const sharedParMean = React.useMemo<number | null>(() => {
    const parAliases = getParameterAliases('par');
    for (const fieldMap of meansByLocationField.values()) {
      for (const alias of parAliases) {
        const v = fieldMap.get(alias);
        if (typeof v === 'number' && Number.isFinite(v)) return v;
      }
    }
    return null;
  }, [meansByLocationField]);

  const valueOverrideFor = React.useCallback(
    (bay: Bay | null) =>
      (parameterKey: string): number | null => {
        if (parameterKey === 'par' || parameterKey === 'par_estimated') {
          return sharedParMean;
        }
        const aliases = getParameterAliases(parameterKey);
        for (const key of candidateLocationKeys(bay)) {
          const fieldMap = meansByLocationField.get(key);
          if (!fieldMap) continue;
          for (const alias of aliases) {
            const v = fieldMap.get(alias);
            if (typeof v === 'number' && Number.isFinite(v)) return v;
          }
        }
        return null;
      },
    [meansByLocationField, sharedParMean],
  );

  if (orderedParameters.length === 0 || greenhouses.length === 0) {
    return (
      <Card className="flex h-full min-h-0 items-center justify-center rounded-sm p-6">
        <p className="text-muted-foreground text-sm">{noDataMessage}</p>
      </Card>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 content-start items-stretch gap-1 pb-1 sm:grid-cols-2 sm:gap-2 xl:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))]">
        {greenhouses.map((greenhouse, index) => (
          <GreenhouseSummaryCard
            key={greenhouse.key}
            title={greenhouse.label}
            bay={greenhouse.bay}
            parameters={orderedParameters}
            noDataMessage={noDataMessage}
            valueOverride={valueOverrideFor(greenhouse.bay)}
            onParameterClick={
              onParameterClick
                ? (parameterKey) => onParameterClick(index, parameterKey)
                : undefined
            }
          />
        ))}
      </div>

      <ParGraphSection
        bay={null}
        greenhouseLabel={parGraphLabel}
        tenantId={parGraphTenantId}
        embedded
        className="min-h-[15rem] w-full shrink-0 sm:min-h-[17rem] md:min-h-[20rem] lg:min-h-[24rem]"
      />
    </div>
  );
}

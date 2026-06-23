import * as React from 'react';
import {
  useGetParDliForTenantQuery,
  useMeQuery,
  type GetParDliForTenantQuery,
} from '@/generated/graphql';
import type {
  ParGraphData,
  ParCurvePoint,
  ParBandPoint,
} from '@/types/par-graph';
import { getHourOfDay } from '@/lib/utils/par-graph';

type TenantParDli = GetParDliForTenantQuery['getParDliForTenant'];
type ParDliResult = TenantParDli['combined'];

/**
 * Fetches today's PAR/DLI for the active tenant and selects the slice the
 * caller wants to render (`greenhouseName` for a specific greenhouse, or
 * `null/undefined` for the combined view).
 *
 * The same `getParDliForTenant` query runs for every `<ParGraphSection>`
 * on the page; Apollo deduplicates them because the variables match.
 * That means each component just picks its own slice from the cached
 * `TenantParDli` payload — no extra round trips when switching tabs.
 *
 * Fallback behaviour: when a tenant has no sensor→greenhouse mapping,
 * the backend returns `greenhouses: []` and the per-greenhouse path is
 * meaningless. In that case we always render `combined` — so per-tab
 * navigation degrades gracefully to "one combined PAR graph" for those
 * tenants, matching the spec.
 */
export function useParGraphData(
  tenantIdOverride?: string | null,
  greenhouseName?: string | null,
): ParGraphData {
  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-first' });

  // Send the viewer's IANA timezone so Flux can align today's window and the
  // historical band's hour buckets to local time. Without this the band wraps
  // by the UTC offset (e.g. Germany's +2h DST puts the night-time high
  // cumulative value at the start of the chart).
  const timezone = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      return null;
    }
  }, []);

  // Skip until we have *some* tenant context to send. Tenant users have
  // `me.tenant.id`; vGreens admins viewing another tenant pass an explicit
  // override. Without either the backend would 400 with "Tenant context
  // is required" — better to wait for auth to resolve.
  const hasTenantContext = !!tenantIdOverride || !!meData?.me?.tenant?.id;

  const { data } = useGetParDliForTenantQuery({
    variables: { tenantId: tenantIdOverride ?? null, timezone },
    skip: !hasTenantContext,
    fetchPolicy: 'cache-and-network',
  });

  const result = React.useMemo<ParDliResult | undefined>(() => {
    const tenantPayload = data?.getParDliForTenant;
    if (!tenantPayload) return undefined;
    if (!greenhouseName) return tenantPayload.combined;
    const match = tenantPayload.greenhouses.find(
      (g) => g.name === greenhouseName,
    );
    // Tenants without a mapping return `greenhouses: []`; fall through to
    // combined so per-greenhouse tabs still render meaningfully.
    return match?.data ?? tenantPayload.combined;
  }, [data, greenhouseName]);

  const apiPoints = React.useMemo(() => {
    const raw = result?.todaysGraphData ?? [];
    if (!raw.length) return [];

    const points = raw
      .map((p) => {
        const date = new Date(p.time as unknown as string);
        return {
          hour: getHourOfDay(date),
          dli: typeof p.dli === 'number' ? p.dli : Number(p.dli ?? 0),
        };
      })
      .filter((p) => !Number.isNaN(p.hour) && !Number.isNaN(p.dli))
      .sort((a, b) => a.hour - b.hour);

    const first = points[0];
    if (first && first.hour > 0) {
      points.unshift({ hour: 0, dli: 0 });
    }

    return points;
  }, [result]);

  const curveData: ParCurvePoint[] = React.useMemo(
    () => apiPoints.map((p) => ({ hour: p.hour, today: p.dli })),
    [apiPoints],
  );

  const toBandPoints = React.useCallback(
    (raw: readonly { hour: number; dli?: number | null }[] | undefined) => {
      if (!raw?.length) return [];
      return raw
        .map<ParBandPoint>((p) => ({
          hour: p.hour,
          dli: typeof p.dli === 'number' ? p.dli : null,
        }))
        .filter((p) => Number.isFinite(p.hour))
        .sort((a, b) => a.hour - b.hour);
    },
    [],
  );

  const lowerEdge = React.useMemo(
    () => toBandPoints(result?.lowerEdge),
    [result, toBandPoints],
  );
  const upperEdge = React.useMemo(
    () => toBandPoints(result?.upperEdge),
    [result, toBandPoints],
  );

  const currentHour = React.useMemo(() => getHourOfDay(new Date()), []);

  const currentDli = result?.currentDLI ?? 0;
  const currentPpfd =
    typeof result?.currentPPFD === 'number'
      ? Math.round(result.currentPPFD)
      : null;

  const yMax = React.useMemo(() => {
    const maxToday = curveData.reduce((acc, d) => Math.max(acc, d.today), 0);
    const maxUpper = upperEdge.reduce((acc, d) => Math.max(acc, d.dli ?? 0), 0);
    const maxSeries = Math.max(maxToday, maxUpper);
    if (maxSeries === 0) return 5;
    return Math.ceil((maxSeries + 1) / 5) * 5;
  }, [curveData, upperEdge]);

  const timeLabel = React.useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  return {
    curveData,
    lowerEdge,
    upperEdge,
    currentHour,
    currentDli,
    currentPpfd,
    timeLabel,
    yMax,
  };
}

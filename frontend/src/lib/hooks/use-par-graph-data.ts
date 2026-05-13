import * as React from 'react';
import { useGetParDliTodayQuery, useMeQuery } from '@/generated/graphql';
import type {
  ParGraphData,
  ParCurvePoint,
  ParBandPoint,
} from '@/types/par-graph';
import { getHourOfDay } from '@/lib/utils/par-graph';

export function useParGraphData(
  bucketNameOverride?: string | null,
): ParGraphData {
  const { data: meData } = useMeQuery({
    fetchPolicy: 'cache-first',
  });
  // Prefer the explicit override (set by vGreens admins viewing another
  // tenant). Fall back to the signed-in user's own tenant bucket so the
  // tenant-side flow keeps working unchanged.
  const bucketName =
    bucketNameOverride ?? meData?.me?.tenant?.influxBucketName ?? null;

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

  const { data: parDliData } = useGetParDliTodayQuery({
    variables: { bucketName: bucketName ?? '', timezone },
    skip: !bucketName,
    fetchPolicy: 'cache-and-network',
  });

  const result = parDliData?.getParDliToday;

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
    const maxUpper = upperEdge.reduce(
      (acc, d) => Math.max(acc, d.dli ?? 0),
      0,
    );
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

import * as React from 'react';
import { useGetParDliTodayQuery, useMeQuery } from '@/generated/graphql';
import type { ParGraphData, ParCurvePoint } from '@/types/par-graph';
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

  const { data: parDliData } = useGetParDliTodayQuery({
    variables: { bucketName: bucketName ?? '' },
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

  const currentHour = React.useMemo(() => getHourOfDay(new Date()), []);

  const currentDli = result?.currentDLI ?? 0;
  const currentPpfd =
    typeof result?.currentPPFD === 'number'
      ? Math.round(result.currentPPFD)
      : null;

  const yMax = React.useMemo(() => {
    if (!curveData.length) return 5;
    const maxSeries = curveData.reduce((acc, d) => Math.max(acc, d.today), 0);
    return Math.ceil((maxSeries + 1) / 5) * 5;
  }, [curveData]);

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
    currentHour,
    currentDli,
    currentPpfd,
    timeLabel,
    yMax,
  };
}

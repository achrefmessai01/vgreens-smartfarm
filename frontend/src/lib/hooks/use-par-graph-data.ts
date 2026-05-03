import * as React from 'react';
import { useGetParDliTodayQuery, useMeQuery } from '@/generated/graphql';
import type { ParGraphData, ParCurvePoint } from '@/types/par-graph';
import { getHourOfDay } from '@/lib/utils/par-graph';

export function useParGraphData(
  greenhouseId: string,
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
    variables: {
      input: {
        bucketName: bucketName ?? '',
        greenhouse: greenhouseId,
      },
    },
    skip: !bucketName || !greenhouseId,
    fetchPolicy: 'cache-and-network',
  });

  const apiPoints = React.useMemo(() => {
    const raw = parDliData?.getParDliToday ?? [];
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
  }, [parDliData]);

  const curveData: ParCurvePoint[] = React.useMemo(() => {
    if (!apiPoints.length) return [];

    return apiPoints.map((p) => {
      const today = p.dli;
      const avg = today * 0.97;
      const yesterday = today * 0.92;
      const lowerBand = avg * 0.85;
      const upperBand = avg * 1.08;

      return {
        hour: p.hour,
        avg,
        yesterday,
        today,
        lowerBand,
        band: Math.max(0, upperBand - lowerBand),
      };
    });
  }, [apiPoints]);

  const currentHour = React.useMemo(() => getHourOfDay(new Date()), []);

  const currentDli = React.useMemo(() => {
    if (!apiPoints.length) return 0;
    let last = apiPoints[0].dli;
    for (const p of apiPoints) {
      if (p.hour <= currentHour) {
        last = p.dli;
      } else {
        break;
      }
    }
    return last;
  }, [apiPoints, currentHour]);

  /**
   * Live PPFD (µmol m⁻² s⁻¹) recovered from the cumulative DLI curve.
   *
   * Two refinements over the naive "delta between the last two points"
   * approach:
   *
   *   1. **Trailing window of ~5 minutes** instead of the last 60-second
   *      sample. With minute-level granularity a single sample can be
   *      noisy (a passing cloud, a sensor glitch, a missed window after
   *      `aggregateWindow(createEmpty: false)`). Averaging across the last
   *      five points is what most agronomic dashboards do for the "current"
   *      indicator.
   *
   *   2. **Biological sanity cap at 2 500 µmol m⁻² s⁻¹**. Direct sun at sea
   *      level peaks around 2 000; anything north of that means a sensor
   *      anomaly (mis-calibrated lux sensor, multi-source double-counting,
   *      etc.). Showing "—" is more informative than printing an obviously
   *      wrong four-digit number.
   */
  const currentPpfd = React.useMemo(() => {
    if (apiPoints.length < 2) return null;

    const PPFD_TRAILING_MINUTES = 5;
    const PPFD_MAX_REALISTIC = 2500; // µmol m⁻² s⁻¹

    const last = apiPoints[apiPoints.length - 1];
    const targetHour = last.hour - PPFD_TRAILING_MINUTES / 60;

    // Walk backwards until the candidate is at least PPFD_TRAILING_MINUTES
    // earlier, or we hit the start of the series.
    let prevIndex = apiPoints.length - 2;
    while (prevIndex > 0 && apiPoints[prevIndex].hour > targetHour) {
      prevIndex -= 1;
    }
    const prev = apiPoints[prevIndex];

    const deltaDli = last.dli - prev.dli;
    const deltaSeconds = (last.hour - prev.hour) * 3600;
    if (deltaDli <= 0 || deltaSeconds <= 0) return null;

    const ppfd = (deltaDli * 1_000_000) / deltaSeconds;
    if (!Number.isFinite(ppfd) || ppfd > PPFD_MAX_REALISTIC) return null;

    return Math.round(ppfd);
  }, [apiPoints]);

  const yMax = React.useMemo(() => {
    if (!curveData.length) return 5;
    const maxSeries = Math.max(
      ...curveData.map((d) =>
        Math.max(d.avg, d.yesterday, d.today ?? 0, d.lowerBand + d.band),
      ),
    );
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

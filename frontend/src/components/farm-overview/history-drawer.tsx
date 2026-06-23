'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { StyledSelect } from '@/components/ui/styled-select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ParameterType } from '@/types/farm.types';
import { useMeQuery, useGetBucketDataQuery } from '@/generated/graphql';
import { HistoryChartSkeleton } from './history-chart-skeleton';
import { useI18n, useLocaleFormatters } from '@/i18n';

/** Parse slotId (e.g. "live_greenhouse_01|Air_09|unknown") into greenhouse, device, level for InfluxDB filters */
function parseSlotId(slotId: string): {
  greenhouse: string;
  device: string;
  level: string;
} {
  const raw = slotId.replace(/^live_/, '');
  const parts = raw.split('|');
  return {
    greenhouse: parts[0] ?? '',
    device: parts[1] ?? '',
    level: parts[2] ?? '',
  };
}

function getStartStopForRange(timeRange: '1day' | '1week' | '1month'): {
  start: string;
  stop: string;
} {
  const now = new Date();
  const stop = now.toISOString();
  let start: Date;
  switch (timeRange) {
    case '1day':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '1week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1month':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }
  return { start: start.toISOString(), stop };
}

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameter: ParameterType;
  slotId: string | null;
  /**
   * Real InfluxDB `greenhouse` tag for the selected slot. Used to scope the
   * history query to the exact series — the slot id's greenhouse segment can be
   * an assigned display name, so it must not be used as a tag filter (VSL-221).
   */
  greenhouse?: string | null;
  parameterLabel: string;
  timeRangeLabel: string;
  oneDayLabel: string;
  oneWeekLabel: string;
  oneMonthLabel: string;
  historyLabel: string;
  bucketName?: string | null;
}

export function HistoryDrawer({
  open,
  onOpenChange,
  parameter,
  slotId,
  greenhouse,
  parameterLabel,
  timeRangeLabel,
  oneDayLabel,
  oneWeekLabel,
  oneMonthLabel,
  historyLabel,
  bucketName: bucketNameOverride,
}: HistoryDrawerProps) {
  const { t } = useI18n();
  const { formatDate, formatDateTime } = useLocaleFormatters();

  const [timeRange, setTimeRange] = React.useState<'1day' | '1week' | '1month'>(
    '1month',
  );
  const [selectedPointIndex, setSelectedPointIndex] = React.useState<
    number | null
  >(null);

  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-first' });
  const bucketName =
    bucketNameOverride ?? meData?.me?.tenant?.influxBucketName ?? null;
  const slotFilters = React.useMemo(
    () => (slotId ? parseSlotId(slotId) : null),
    [slotId],
  );
  const startStop = React.useMemo(
    () => getStartStopForRange(timeRange),
    [timeRange],
  );

  const { data: bucketData, loading: historyLoading } = useGetBucketDataQuery({
    variables: {
      input: {
        bucketName: bucketName ?? '',
        start: startStop.start,
        stop: startStop.stop ?? undefined,
        limit: 2000,
        field: parameter,
        greenhouse: greenhouse ?? undefined,
        device: slotFilters?.device ?? undefined,
        level:
          slotFilters?.level && slotFilters.level.toLowerCase() !== 'unknown'
            ? slotFilters.level
            : undefined,
        useLastPerSeries: false,
      },
    },
    skip: !bucketName || !slotId || !open,
    fetchPolicy: 'cache-and-network',
  });

  const historyData = React.useMemo(() => {
    if (!bucketData?.getBucketData?.length) return [];
    return bucketData.getBucketData
      .map((item, index) => {
        const d = item.data;
        const t = d._time as string | undefined;
        const v = d._value;
        if (t == null) return null;
        const num =
          typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
        if (Number.isNaN(num)) return null;
        return {
          timestamp: new Date(t).getTime(),
          value: num,
          index,
        };
      })
      .filter((p): p is { timestamp: number; value: number; index: number } =>
        Boolean(p),
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [bucketData]);

  // Reset selected point when slot or parameter changes
  React.useEffect(() => {
    setSelectedPointIndex(null);
  }, [slotId, parameter, timeRange]);

  if (!slotId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[70svh] flex-col sm:h-[60vh]"
      >
        <SheetHeader>
          <SheetTitle>
            {historyLabel} - {parameterLabel}
          </SheetTitle>
          <SheetDescription>{slotId}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium">{timeRangeLabel}:</label>
            <div className="w-full sm:w-auto">
              <StyledSelect
                value={timeRange}
                onValueChange={(value) =>
                  setTimeRange(value as '1day' | '1week' | '1month')
                }
                options={[
                  { label: oneDayLabel, value: '1day' },
                  { label: oneWeekLabel, value: '1week' },
                  { label: oneMonthLabel, value: '1month' },
                ]}
                width="100%"
                triggerClassName="w-full sm:w-[180px]"
              />
            </div>
          </div>
          <div className="min-h-[200px] flex-1">
            {historyLoading ? (
              <HistoryChartSkeleton className="h-full w-full" />
            ) : historyData.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                {t.pages.farmOverview.emptyHistoryDrawerPlaceholder}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      formatDate(new Date(value), {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    height={28}
                    tickMargin={8}
                    minTickGap={24}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    width={44}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    labelFormatter={(value) => formatDateTime(new Date(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#016F7C"
                    strokeWidth={2}
                    dot={(props: {
                      cx?: number;
                      cy?: number;
                      payload?: {
                        timestamp: number;
                        value: number;
                        index: number;
                      };
                      index?: number;
                    }) => {
                      // Recharts renders one dot per point, so each returned
                      // node needs a stable, unique `key`.
                      const dotKey = `dot-${props.index ?? props.payload?.index ?? 'x'}`;
                      if (!props.cx || !props.cy || !props.payload) {
                        return <g key={dotKey} />;
                      }
                      const pointIndex =
                        props.payload.index ?? props.index ?? -1;
                      if (pointIndex === -1) return <g key={dotKey} />;
                      const isSelected = selectedPointIndex === pointIndex;
                      return (
                        <circle
                          key={dotKey}
                          cx={props.cx}
                          cy={props.cy}
                          // Default dots are transparent (but still clickable —
                          // `transparent` is hit-tested, `none` would not be) so
                          // the line itself reads clearly. Only the selected
                          // point gets a visible marker.
                          r={isSelected ? 6 : 7}
                          fill={isSelected ? '#016F7C' : 'transparent'}
                          stroke={isSelected ? 'white' : 'transparent'}
                          strokeWidth={isSelected ? 3 : 0}
                          className="cursor-pointer transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPointIndex(
                              isSelected ? null : pointIndex,
                            );
                          }}
                          style={{
                            filter: isSelected
                              ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
                              : 'none',
                          }}
                        />
                      );
                    }}
                    activeDot={{
                      r: 4,
                      fill: '#016F7C',
                      stroke: 'white',
                      strokeWidth: 1.5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

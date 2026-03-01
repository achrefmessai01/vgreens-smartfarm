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
import type { ParameterType } from '@/lib/farm-types';
import { useMeQuery, useGetBucketDataQuery } from '@/generated/graphql';
import { HistoryChartSkeleton } from './history-chart-skeleton';
import { useI18n } from '@/i18n';

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
  parameterLabel,
  timeRangeLabel,
  oneDayLabel,
  oneWeekLabel,
  oneMonthLabel,
  historyLabel,
  bucketName: bucketNameOverride,
}: HistoryDrawerProps) {
  const { t } = useI18n();

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
        greenhouse: slotFilters?.greenhouse ?? undefined,
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
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>
            {historyLabel} - {parameterLabel}
          </SheetTitle>
          <SheetDescription>{slotId}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium ml-5">
              {timeRangeLabel}:
            </label>
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
              width="180px"
            />
          </div>
          <div className="h-[400px]">
            {historyLoading ? (
              <HistoryChartSkeleton className="h-full w-full" />
            ) : historyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t.pages.farmOverview.emptyHistoryDrawerPlaceholder}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleString();
                    }}
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
                      if (!props.cx || !props.cy || !props.payload) {
                        return <g />;
                      }
                      const pointIndex =
                        props.payload.index ?? props.index ?? -1;
                      if (pointIndex === -1) return <g />;
                      const isSelected = selectedPointIndex === pointIndex;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={isSelected ? 6 : 4}
                          fill="#016F7C"
                          stroke="white"
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="cursor-pointer transition-all hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPointIndex(
                              isSelected ? null : pointIndex,
                            );
                          }}
                          style={{
                            filter: isSelected
                              ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
                              : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                          }}
                        />
                      );
                    }}
                    activeDot={false}
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

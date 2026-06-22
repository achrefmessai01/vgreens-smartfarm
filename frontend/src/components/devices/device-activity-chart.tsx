'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useI18n } from '@/i18n';

interface DeviceActivityChartProps {
  data: { time: string; count: number }[];
}

export function DeviceActivityChart({ data }: DeviceActivityChartProps) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;

  const chartConfig = {
    count: { label: ds.summary.dataPoints, color: 'var(--primary)' },
  } satisfies ChartConfig;

  const formatTick = React.useCallback((value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }).format(d);
  }, []);

  return (
    <Card className="border-border/40 bg-card/50 min-w-0 shadow-lg shadow-black/5 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="text-muted-foreground h-4 w-4" />
          {ds.charts.activityTitle}
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {ds.charts.activitySubtitle}
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {ds.charts.noData}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent labelFormatter={(_, p) => formatTick(String(p?.[0]?.payload?.time ?? ''))} />
                }
              />
              <Area
                dataKey="count"
                type="monotone"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#fillCount)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

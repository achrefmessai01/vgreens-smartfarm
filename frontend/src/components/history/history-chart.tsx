'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Area,
  AreaChart,
  Line,
  LineChart,
  ComposedChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { HistoryViewType } from './history-table';

export interface HistoryChartData {
  week: number;
  yield?: number;
  brix?: number;
}

interface HistoryChartProps {
  data: HistoryChartData[];
  viewType: HistoryViewType;
  title: string;
}

const chartConfig = {
  yield: {
    label: 'Yield',
    color: '#016F7C',
  },
  brix: {
    label: 'Brix',
    color: '#016F7C',
  },
} satisfies ChartConfig;

export function HistoryChart({ data, viewType, title }: HistoryChartProps) {
  const chartData = data.map((d) => ({
    week: `Week ${d.week}`,
    weekNum: d.week,
    yield: d.yield ? Number(d.yield.toFixed(2)) : undefined,
    brix: d.brix ? Number(d.brix.toFixed(2)) : undefined,
  }));

  const yDomain: [number, number] = [4, 16];
  const yTicks = [4, 6, 8, 10, 12, 14, 16];

  const showYield = viewType === 'yield' || viewType === 'both';
  const showBrix = viewType === 'brix' || viewType === 'both';

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig}>
        {viewType === 'both' ? (
          <ComposedChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#016F7C" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#016F7C" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#016F7C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              width={40}
              label={{
                value: 'TONS',
                angle: -90,
                position: 'left',
                offset: -10,
                style: {
                  textAnchor: 'middle',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: '16px',
                },
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {showYield && (
              <Area
                dataKey="yield"
                type="monotone"
                stroke="#016F7C"
                strokeWidth={3}
                fill="url(#colorYield)"
              />
            )}
            {showBrix && (
              <Line
                dataKey="brix"
                type="monotone"
                stroke="#016F7C"
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        ) : (
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#016F7C" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#016F7C" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#016F7C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              width={40}
              label={{
                value: 'TONS',
                angle: -90,
                position: 'left',
                offset: -10,
                style: {
                  textAnchor: 'middle',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: '16px',
                },
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey={showYield ? 'yield' : 'brix'}
              type="monotone"
              stroke="#016F7C"
              strokeWidth={3}
              fill="url(#colorHistory)"
            />
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  );
}

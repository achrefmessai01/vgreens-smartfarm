'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import {
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ParCurvePoint } from '@/types/par-graph';
import {
  HOUR_TICKS,
  formatHourTick,
  formatTooltipHourLabel,
  formatTooltipValue,
} from '@/lib/utils/par-graph';

export interface ParGraphChartProps {
  curveData: ParCurvePoint[];
  currentHour: number;
  currentDli: number;
  yMax: number;
}

export function ParGraphChart({
  curveData,
  currentHour,
  currentDli,
  yMax,
}: ParGraphChartProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.parGraph;

  const effectiveYMax = React.useMemo(
    () => Math.ceil((yMax + 1) / 5) * 5,
    [yMax],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-3">
      <div className="text-muted-foreground mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[10px]"></div>

      <div className="min-h-[10rem] flex-1 sm:min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={curveData}
            margin={{ top: 6, right: 6, left: 2, bottom: 14 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              type="number"
              domain={[0, 24]}
              ticks={HOUR_TICKS}
              tickFormatter={formatHourTick}
              tickLine={false}
              axisLine={false}
              height={28}
              tick={{ fontSize: 9 }}
            >
              <Label
                value={labels.timeOfDayLabel}
                position="insideBottom"
                offset={-6}
                style={{ fontSize: 10 }}
              />
            </XAxis>
            <YAxis
              domain={[0, effectiveYMax]}
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 9 }}
            >
              <Label
                value={labels.axisLabel}
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle', fontSize: 10 }}
              />
            </YAxis>
            <Tooltip
              formatter={(value: unknown, name: string) => {
                const num =
                  typeof value === 'number' && !Number.isNaN(value)
                    ? value
                    : null;
                return [formatTooltipValue(num), name];
              }}
              labelFormatter={formatTooltipHourLabel}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.375rem',
                color: 'hsl(var(--popover-foreground))',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
              }}
              labelStyle={{
                color: 'hsl(var(--popover-foreground))',
                fontWeight: 600,
              }}
              itemStyle={{
                color: 'hsl(var(--popover-foreground))',
              }}
              cursor={{
                stroke: 'hsl(var(--muted-foreground))',
                strokeDasharray: '4 4',
                strokeOpacity: 0.4,
              }}
              wrapperStyle={{ outline: 'none', zIndex: 20 }}
            />

            <ReferenceLine
              x={Number(currentHour.toFixed(2))}
              stroke="hsl(var(--border))"
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={currentDli}
              stroke="hsl(var(--border))"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />

            <Line
              dataKey="today"
              type="monotone"
              name="today"
              stroke="hsl(142 100% 50%)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

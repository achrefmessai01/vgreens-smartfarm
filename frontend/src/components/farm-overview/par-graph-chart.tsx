'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import {
  Area,
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

export interface ParGraphLinePoint {
  hour: number;
  value: number;
}

export interface ParGraphChartProps {
  curveData: ParCurvePoint[];
  currentHour: number;
  currentDli: number;
  yMax: number;
  dli: ParGraphLinePoint[];
  lowerEdge: ParGraphLinePoint[];
  upperEdge: ParGraphLinePoint[];
}

export function ParGraphChart({
  curveData,
  currentHour,
  currentDli,
  yMax,
  dli,
  lowerEdge,
  upperEdge,
}: ParGraphChartProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.parGraph;

  const mergedMock = React.useMemo(() => {
    const byHour = new Map<
      number,
      {
        hour: number;
        dli?: number;
        lowerEdge?: number;
        upperEdge?: number;
        band?: [number, number];
      }
    >();
    const ensure = (hour: number) => {
      let entry = byHour.get(hour);
      if (!entry) {
        entry = { hour };
        byHour.set(hour, entry);
      }
      return entry;
    };
    for (const p of dli) ensure(p.hour).dli = p.value;
    for (const p of lowerEdge) ensure(p.hour).lowerEdge = p.value;
    for (const p of upperEdge) ensure(p.hour).upperEdge = p.value;
    for (const entry of byHour.values()) {
      if (entry.lowerEdge !== undefined && entry.upperEdge !== undefined) {
        entry.band = [entry.lowerEdge, entry.upperEdge];
      }
    }
    return Array.from(byHour.values()).sort((a, b) => a.hour - b.hour);
  }, [dli, lowerEdge, upperEdge]);

  const effectiveYMax = React.useMemo(() => {
    const mockMax = mergedMock.reduce(
      (acc, p) => Math.max(acc, p.dli ?? 0, p.lowerEdge ?? 0, p.upperEdge ?? 0),
      0,
    );
    const combined = Math.max(yMax, mockMax);
    return Math.ceil((combined + 1) / 5) * 5;
  }, [mergedMock, yMax]);

  void curveData;

  return (
    <div className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-3">
      <div className="text-muted-foreground mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[10px]"></div>

      <div className="min-h-[10rem] flex-1 sm:min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mergedMock}
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

            <Area
              dataKey="band"
              type="monotone"
              name="band"
              stroke="none"
              fill="hsl(142 91% 50%)"
              fillOpacity={0.15}
              activeDot={false}
              isAnimationActive={false}
            />

            <Line
              dataKey="dli"
              type="monotone"
              name="dli"
              stroke="hsl(142 100% 50%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="lowerEdge"
              type="monotone"
              name="lowerEdge"
              stroke="hsl(142 91% 55%)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="upperEdge"
              type="monotone"
              name="upperEdge"
              stroke="hsl(142 91% 55%)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

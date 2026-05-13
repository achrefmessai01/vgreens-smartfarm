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
import type { ParBandPoint, ParCurvePoint } from '@/types/par-graph';
import {
  HOUR_TICKS,
  formatHourTick,
  formatTooltipHourLabel,
  formatTooltipValue,
} from '@/lib/utils/par-graph';

export interface ParGraphChartProps {
  curveData: ParCurvePoint[];
  lowerEdge: ParBandPoint[];
  upperEdge: ParBandPoint[];
  currentHour: number;
  currentDli: number;
  yMax: number;
}

export function ParGraphChart({
  curveData,
  lowerEdge,
  upperEdge,
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

  /**
   * Merge today's 5-min cumulative DLI samples and the 24 hourly band
   * points into one dataset, keyed by `hour`. Each Line/Area component
   * draws only the rows where its `dataKey` is defined, so the today
   * curve (fine-grained) and the band edges (24 sparse points) coexist
   * on the same x-axis without forcing one to interpolate through the
   * other's null cells.
   *
   * `band` is a 2-tuple `[lower, upper]` for the recharts Area component
   * — emitted only when both edges have a non-null DLI so gaps stay gaps.
   */
  const mergedData = React.useMemo(() => {
    type Row = {
      hour: number;
      today?: number;
      lowerEdge?: number | null;
      upperEdge?: number | null;
      band?: [number, number];
    };
    const byHour = new Map<number, Row>();
    const ensure = (hour: number): Row => {
      let row = byHour.get(hour);
      if (!row) {
        row = { hour };
        byHour.set(hour, row);
      }
      return row;
    };
    for (const p of curveData) ensure(p.hour).today = p.today;
    for (const p of lowerEdge) ensure(p.hour).lowerEdge = p.dli ?? null;
    for (const p of upperEdge) ensure(p.hour).upperEdge = p.dli ?? null;
    for (const row of byHour.values()) {
      if (
        typeof row.lowerEdge === 'number' &&
        typeof row.upperEdge === 'number'
      ) {
        row.band = [row.lowerEdge, row.upperEdge];
      }
    }
    return Array.from(byHour.values()).sort((a, b) => a.hour - b.hour);
  }, [curveData, lowerEdge, upperEdge]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-3">
      <div className="text-muted-foreground mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[10px]"></div>

      <div className="min-h-[10rem] flex-1 sm:min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mergedData}
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

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
   * points into one dataset, keyed by `hour`.
   *
   * The band edges are only known at integer hours, but we **interpolate**
   * them linearly at every today-curve hour too. Without this, recharts
   * sees `band === undefined` at every 5-min row in between band hours
   * (since today rows don't carry band values) and treats those as gaps
   * — visually the Area only renders past the current hour where there
   * are no today rows interrupting it. Cumulative DLI is roughly linear
   * within an hour (constant PPFD assumption) so the interpolation is
   * faithful.
   *
   * Legitimate gaps still surface as `undefined`: when an hour has no
   * historical samples on any of the lookback days, both surrounding
   * band points have null DLI and the interpolation propagates that.
   */
  const mergedData = React.useMemo(() => {
    const lowerByHour = new Map<number, number>();
    const upperByHour = new Map<number, number>();
    for (const p of lowerEdge) {
      if (typeof p.dli === 'number') lowerByHour.set(p.hour, p.dli);
    }
    for (const p of upperEdge) {
      if (typeof p.dli === 'number') upperByHour.set(p.hour, p.dli);
    }
    const interp = (
      hour: number,
      byHour: Map<number, number>,
    ): number | undefined => {
      const lh = Math.floor(hour);
      const uh = Math.ceil(hour);
      const lv = byHour.get(lh);
      const uv = byHour.get(uh);
      if (lv == null || uv == null) return undefined;
      if (lh === uh) return lv;
      return lv + (uv - lv) * (hour - lh);
    };

    const todayByHour = new Map<number, number>();
    for (const p of curveData) todayByHour.set(p.hour, p.today);

    const allHours = new Set<number>(todayByHour.keys());
    for (let h = 0; h < 24; h++) allHours.add(h);

    return Array.from(allHours)
      .sort((a, b) => a - b)
      .map((hour) => {
        const lower = interp(hour, lowerByHour);
        const upper = interp(hour, upperByHour);
        const band: [number, number] | undefined =
          lower != null && upper != null ? [lower, upper] : undefined;
        return {
          hour,
          today: todayByHour.get(hour),
          lowerEdge: lower,
          upperEdge: upper,
          band,
        };
      });
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
              tooltipType="none"
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

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import {
  Area,
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ParCurvePoint, ParGraphSectionProps } from '@/types/par-graph';
import { useParGraphData } from '@/lib/hooks/use-par-graph-data';
import {
  HOUR_TICKS,
  formatHourTick,
  formatTooltipHourLabel,
  formatTooltipValue,
} from '@/lib/utils/par-graph';

interface ParGraphHeaderProps {
  greenhouseLabel: string;
  timeLabel: string;
  currentPpfd: number | null;
  currentDli: number;
}

function ParGraphHeader({
  greenhouseLabel,
  timeLabel,
  currentPpfd,
  currentDli,
}: ParGraphHeaderProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.parGraph;

  return (
    <div className="border-b border-border/50 bg-muted/15 px-3 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
            {labels.title} - {greenhouseLabel}
          </p>
          <p className="text-[11px] text-muted-foreground">{timeLabel} h</p>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 overflow-hidden rounded-sm border border-border/60 bg-background text-[10px] sm:w-auto">
          <div className="min-w-0 border-r border-border/60 px-2 py-1.5">
            <p className="text-muted-foreground">{labels.currentPpfd}</p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {currentPpfd ?? '--'}
            </p>
            <p className="text-[9px] text-muted-foreground">umol m^-2 s^-1</p>
          </div>
          <div className="min-w-0 px-2 py-1.5">
            <p className="text-muted-foreground">{labels.dli}</p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {currentDli.toFixed(1)}
            </p>
            <p className="text-[9px] text-muted-foreground">mol m^-2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParGraphChartProps {
  curveData: ParCurvePoint[];
  currentHour: number;
  currentDli: number;
  yMax: number;
}

function ParGraphChart({
  curveData,
  currentHour,
  currentDli,
  yMax,
}: ParGraphChartProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.parGraph;

  return (
    <div className="flex flex-1 min-h-0 flex-col p-1.5 sm:p-3">
      <div className="mb-2 shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 border-t border-dashed border-slate-400" />
          {labels.legendAverage}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 border-t border-slate-500" />
          {labels.legendYesterday}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 border-t-2 border-emerald-600" />
          {labels.legendToday}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
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
              domain={[0, yMax]}
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
              type="monotone"
              dataKey="lowerBand"
              stackId="parBand"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="band"
              stackId="parBand"
              stroke="none"
              fill="#34D399"
              fillOpacity={0.65}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="avg"
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={1.4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="yesterday"
              stroke="#64748B"
              strokeWidth={1.3}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="today"
              stroke="#059669"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ParGraphSection({
  bay,
  greenhouseId,
  greenhouseLabel,
  embedded = false,
  className,
}: ParGraphSectionProps) {
  void bay;

  const { t } = useI18n();
  const { curveData, currentHour, currentDli, currentPpfd, timeLabel, yMax } =
    useParGraphData(greenhouseId);

  const hasData = curveData.length > 0;
  const content = (
    <>
      <ParGraphHeader
        greenhouseLabel={greenhouseLabel}
        timeLabel={timeLabel}
        currentPpfd={currentPpfd}
        currentDli={currentDli}
      />
      {hasData ? (
        <ParGraphChart
          curveData={curveData}
          currentHour={currentHour}
          currentDli={currentDli}
          yMax={yMax}
        />
      ) : (
        <div className="flex flex-1 min-h-0 items-center justify-center p-6 text-sm text-muted-foreground">
          {t.pages.farmOverview.noData}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div
        className={cn(
          'h-full min-h-0 flex flex-col overflow-hidden rounded-sm border border-border/50 bg-background',
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Card className={cn('gap-0 py-0 overflow-hidden rounded-sm', className)}>
      {content}
    </Card>
  );
}

'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import type { Bay } from '@/lib/farm-types'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ParGraphSectionProps {
  bay: Bay | null
  greenhouseLabel: string
  embedded?: boolean
  className?: string
}

interface ParCurvePoint {
  hour: number
  avg: number
  yesterday: number
  today: number | null
  lowerBand: number
  band: number
}

const HOUR_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
const SUNRISE_HOUR = 6
const SUNSET_HOUR = 20
const FALLBACK_PPFD = 230
const PREVIEW_TIME_HOUR = 11
const PREVIEW_TIME_MINUTE = 23
const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.375rem',
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
}
const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: 'hsl(var(--popover-foreground))',
  fontWeight: 600,
}
const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: 'hsl(var(--popover-foreground))',
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getLabelSeed(label: string): number {
  let hash = 0
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % 10_000
  }
  return hash
}

function getDummyCurrentPpfd(seed: number): number {
  const offset = (seed % 90) - 45
  return clamp(Math.round(FALLBACK_PPFD + offset), 170, 360)
}

function getDummySampleTime(seed: number): Date {
  const date = new Date()
  const minuteOffset = seed % 5
  date.setHours(PREVIEW_TIME_HOUR, PREVIEW_TIME_MINUTE + minuteOffset, 0, 0)
  return date
}

function daylightShape(hour: number): number {
  if (hour <= SUNRISE_HOUR || hour >= SUNSET_HOUR) return 0
  const progress = (hour - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)
  return Math.max(0, Math.sin(Math.PI * progress))
}

function ppfdAtHour(hour: number, peakPpfd: number): number {
  return daylightShape(hour) * peakPpfd
}

function cumulativeDliAtHour(hour: number, peakPpfd: number): number {
  const targetHour = clamp(hour, 0, 24)
  const stepHours = 0.1
  let cumulative = 0
  let prevHour = 0
  let prevPpfd = ppfdAtHour(prevHour, peakPpfd)

  while (prevHour < targetHour) {
    const nextHour = Math.min(targetHour, prevHour + stepHours)
    const nextPpfd = ppfdAtHour(nextHour, peakPpfd)
    const hoursDelta = nextHour - prevHour
    cumulative += ((prevPpfd + nextPpfd) / 2) * (hoursDelta * 3600) / 1_000_000
    prevHour = nextHour
    prevPpfd = nextPpfd
  }

  return cumulative
}

function estimatePeakPpfd(currentPpfd: number, currentHour: number): number {
  const shapeNow = daylightShape(currentHour)
  if (shapeNow > 0.15) {
    return clamp(currentPpfd / shapeNow, 220, 900)
  }
  return clamp(currentPpfd * 1.25, 220, 900)
}

function buildParCurve(
  currentHour: number,
  peakToday: number,
  peakYesterday: number,
  peakAverage: number,
): ParCurvePoint[] {
  return Array.from({ length: 25 }, (_, hour) => {
    const avg = cumulativeDliAtHour(hour, peakAverage)
    const yesterday = cumulativeDliAtHour(hour, peakYesterday)
    const todayFull = cumulativeDliAtHour(hour, peakToday)
    const today = hour <= currentHour ? todayFull : null
    const lowerBand = avg * 0.85
    const upperBand = avg * 1.08

    return {
      hour,
      avg,
      yesterday,
      today,
      lowerBand,
      band: Math.max(0, upperBand - lowerBand),
    }
  })
}

function formatHourTick(value: number): string {
  const normalized = Math.max(0, Math.min(24, Math.round(value)))
  const hourLabel = normalized.toString().padStart(2, '0')
  return `${hourLabel}:00`
}

function formatTooltipHourLabel(value: number | string): string {
  const numericValue =
    typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(numericValue)) return String(value)
  return `${formatHourTick(numericValue)} h`
}

function formatTooltipValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '--'
  return value.toFixed(1)
}

export function ParGraphSection({
  bay,
  greenhouseLabel,
  embedded = false,
  className,
}: ParGraphSectionProps) {
  void bay

  const labelSeed = React.useMemo(
    () => getLabelSeed(greenhouseLabel),
    [greenhouseLabel],
  )
  const sampleTime = React.useMemo(
    () => getDummySampleTime(labelSeed),
    [labelSeed],
  )
  const currentHour =
    sampleTime.getHours() +
    sampleTime.getMinutes() / 60 +
    sampleTime.getSeconds() / 3600
  const timeLabel = sampleTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const currentPpfd = React.useMemo(
    () => getDummyCurrentPpfd(labelSeed),
    [labelSeed],
  )

  const peaks = React.useMemo(() => {
    const today = estimatePeakPpfd(currentPpfd, currentHour)
    return {
      today,
      yesterday: today * 0.92,
      average: today * 0.97,
    }
  }, [currentPpfd, currentHour])

  const curveData = React.useMemo(
    () =>
      buildParCurve(currentHour, peaks.today, peaks.yesterday, peaks.average),
    [currentHour, peaks.today, peaks.yesterday, peaks.average],
  )

  const currentDli = React.useMemo(
    () => cumulativeDliAtHour(currentHour, peaks.today),
    [currentHour, peaks.today],
  )

  const yMax = React.useMemo(() => {
    const maxSeries = Math.max(
      ...curveData.map((d) =>
        Math.max(d.avg, d.yesterday, d.today ?? 0, d.lowerBand + d.band),
      ),
    )
    return Math.ceil(Math.max(maxSeries, currentDli + 1) / 5) * 5
  }, [curveData, currentDli])

  const chartContent = (
    <>
      <div className="border-b border-border/50 bg-muted/15 px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
              PAR Graph - {greenhouseLabel}
            </p>
            <p className="text-[11px] text-muted-foreground">{timeLabel} h</p>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-border/60 bg-background text-[10px]">
            <div className="min-w-24 border-r border-border/60 px-2 py-1.5">
              <p className="text-muted-foreground">Current PPFD</p>
              <p className="text-lg font-semibold leading-none tabular-nums">
                {currentPpfd}
              </p>
              <p className="text-[9px] text-muted-foreground">umol m^-2 s^-1</p>
            </div>
            <div className="min-w-20 px-2 py-1.5">
              <p className="text-muted-foreground">DLI</p>
              <p className="text-lg font-semibold leading-none tabular-nums">
                {currentDli.toFixed(1)}
              </p>
              <p className="text-[9px] text-muted-foreground">mol m^-2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col p-2 sm:p-3">
        <div className="mb-2 shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-4 border-t border-dashed border-slate-400" />
            7 day average
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-4 border-t border-slate-500" />
            yesterday
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-4 border-t-2 border-emerald-600" />
            today
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curveData}
              margin={{ top: 8, right: 8, left: 10, bottom: 20 }}
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
                height={34}
                tick={{ fontSize: 10 }}
              >
                <Label
                  value="Time of day (hh:mm)"
                  position="insideBottom"
                  offset={-6}
                  style={{ fontSize: 10 }}
                />
              </XAxis>
              <YAxis
                domain={[0, yMax]}
                tickLine={false}
                axisLine={false}
                width={54}
                tick={{ fontSize: 10 }}
              >
                <Label
                  value="Cumulative photons (mol m^-2)"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fontSize: 10 }}
                />
              </YAxis>
              <Tooltip
                formatter={(value: number | null, name: string) => [
                  formatTooltipValue(value),
                  name,
                ]}
                labelFormatter={formatTooltipHourLabel}
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
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
    </>
  )

  if (embedded) {
    return (
      <div
        className={cn(
          'h-full min-h-0 flex flex-col overflow-hidden rounded-sm border border-border/50 bg-background',
          className,
        )}
      >
        {chartContent}
      </div>
    )
  }

  return (
    <Card className={cn('gap-0 py-0 overflow-hidden rounded-sm', className)}>
      {chartContent}
    </Card>
  )
}

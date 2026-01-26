'use client'

import * as React from 'react'
import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useI18n } from '@/i18n'

export interface MonthData {
  month: number
  yield: number
}

interface MonthChartProps {
  data: MonthData[]
  selectedMonth?: number
  onMonthSelect?: (month: number) => void
}

const chartConfig = {
  yield: {
    label: 'Yield',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function MonthChart({
  data,
  selectedMonth,
  onMonthSelect,
}: MonthChartProps) {
  const { t } = useI18n()

  const monthNames = [
    t.pages.nextCyclePlanner.monthNames.january,
    t.pages.nextCyclePlanner.monthNames.february,
    t.pages.nextCyclePlanner.monthNames.march,
    t.pages.nextCyclePlanner.monthNames.april,
    t.pages.nextCyclePlanner.monthNames.may,
    t.pages.nextCyclePlanner.monthNames.june,
    t.pages.nextCyclePlanner.monthNames.july,
    t.pages.nextCyclePlanner.monthNames.august,
    t.pages.nextCyclePlanner.monthNames.september,
    t.pages.nextCyclePlanner.monthNames.october,
    t.pages.nextCyclePlanner.monthNames.november,
    t.pages.nextCyclePlanner.monthNames.december,
  ]

  const chartData = data.map((d) => ({
    month: monthNames[d.month - 1],
    monthNum: d.month,
    yield: Number(d.yield.toFixed(2)),
  }))

  // Y-axis always set to 100 for all varieties
  const yAxisMax = 100
  const yDomain: [number, number] = [0, yAxisMax]
  const yTicks = Array.from(
    { length: Math.floor(yAxisMax / 10) + 1 },
    (_, i) => i * 10
  )

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
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
          dataKey="month"
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
          dataKey="yield"
          type="monotone"
          stroke="#016F7C"
          strokeWidth={3}
          fill="url(#colorYield)"
          dot={(props: {
            cx?: number
            cy?: number
            payload?: { monthNum: number; yield: number }
          }) => {
            if (!props.cx || !props.cy || !props.payload) {
              return <g />
            }
            const isSelected = selectedMonth === props.payload.monthNum
            return (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={isSelected ? 6 : 4}
                fill="#016F7C"
                stroke="white"
                strokeWidth={isSelected ? 3 : 1.5}
                className={
                  onMonthSelect
                    ? 'cursor-pointer transition-all hover:scale-110'
                    : ''
                }
                onClick={() => onMonthSelect?.(props.payload!.monthNum)}
                style={{
                  filter: isSelected
                    ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
                    : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                }}
              />
            )
          }}
          activeDot={{
            r: 6,
            fill: '#016F7C',
            stroke: 'white',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

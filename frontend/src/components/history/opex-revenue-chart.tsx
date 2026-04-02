'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface OpexRevenueData {
  month: string;
  opex: number;
  revenue: number;
}

interface OpexRevenueChartProps {
  data: OpexRevenueData[];
  title: string;
}

const chartConfig = {
  opex: {
    label: 'OpEx',
    color: '#374151',
  },
  revenue: {
    label: 'Revenue',
    color: '#016F7C',
  },
} satisfies ChartConfig;

const monthAbbreviations = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function OpexRevenueChart({ data, title }: OpexRevenueChartProps) {
  const chartData = data.map((d) => {
    const opex = Number(d.opex.toFixed(0));
    const revenue = Number(d.revenue.toFixed(0));
    // For profit area: when revenue > opex, show area from opex to revenue
    // When revenue <= opex, set profitTop to opex (no visible area)
    return {
      month: d.month,
      opex,
      revenue,
      // Profit area top value (revenue when profitable, opex when not)
      profitTop: revenue > opex ? revenue : opex,
      // Profit area base value (always opex, but area only shows when revenue > opex)
      profitBase: opex,
    };
  });

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig}>
        <ComposedChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 0,
            right: 12,
            top: 20,
          }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#016F7C" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#016F7C" stopOpacity={0.1} />
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
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => (
              <span className="text-muted-foreground text-sm">{value}</span>
            )}
          />
          {/* Profit area - shaded between curves where revenue > opex */}
          <Area
            type="monotone"
            dataKey="profitTop"
            stroke="none"
            fill="url(#profitGradient)"
            fillOpacity={1}
            baseValue={1000}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="opex"
            stroke="#374151"
            strokeWidth={2}
            dot={{ r: 4, fill: '#374151' }}
            name="OpEx"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#016F7C"
            strokeWidth={3}
            dot={{ r: 4, fill: '#016F7C' }}
            name="Revenue"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

// Helper function to generate monthly data
export function generateOpexRevenueData(): OpexRevenueData[] {
  return monthAbbreviations.map((month, index) => {
    // Revenue peaks in August, then declines
    const revenue = 3500 + Math.sin((index / 11) * Math.PI) * 22500;
    // Opex is more stable, slightly increasing mid-year
    const opex = 11000 + Math.sin((index / 11) * Math.PI) * 3000;
    return {
      month,
      opex: Math.max(0, opex),
      revenue: Math.max(0, revenue),
    };
  });
}

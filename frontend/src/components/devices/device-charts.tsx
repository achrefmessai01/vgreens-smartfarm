'use client';

import * as React from 'react';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useI18n } from '@/i18n';
import type { DeviceStatus } from '@/generated/graphql';
import { hoursSince } from '@/lib/hooks/use-device-dashboard';
import { STATE_COLORS } from './device-status-constants';

const MAX_BARS = 12;
const chartConfig = {
  value: { label: '', color: 'var(--primary)' },
} satisfies ChartConfig;

interface DeviceChartsProps {
  devices: DeviceStatus[];
}

interface BarRow {
  device: string;
  value: number;
  color: string;
}

function HorizontalBarCard({
  title,
  subtitle,
  rows,
  valueSuffix,
  emptyLabel,
  icon,
}: {
  title: string;
  subtitle: string;
  rows: BarRow[];
  valueSuffix?: string;
  emptyLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border/40 bg-card/50 min-w-0 shadow-lg shadow-black/5 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-muted-foreground" aria-hidden>
            {icon}
          </span>
          {title}
        </CardTitle>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {emptyLabel}
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: Math.max(160, rows.length * 28 + 24) }}
          >
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ left: 8, right: 36, top: 4, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="device"
                tickLine={false}
                axisLine={false}
                width={104}
                tick={{ fontSize: 11 }}
              />
              <Bar dataKey="value" radius={4} barSize={16}>
                {rows.map((row) => (
                  <Cell key={row.device} fill={row.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground text-[11px] tabular-nums"
                  formatter={(v: number) =>
                    valueSuffix ? `${v}${valueSuffix}` : String(v)
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function DeviceCharts({ devices }: DeviceChartsProps) {
  const { t } = useI18n();
  const c = t.pages.deviceStatus.charts;

  // `Date.now()` is impure for render; capture it in an effect instead so the
  // freshness bars get a stable "now" that refreshes when the data changes.
  const [now, setNow] = React.useState(0);
  React.useEffect(() => setNow(Date.now()), [devices]);

  // Per-device activity: least-active first.
  const activityRows: BarRow[] = React.useMemo(
    () =>
      [...devices]
        .sort((a, b) => a.realDataPoints - b.realDataPoints)
        .slice(0, MAX_BARS)
        .map((d) => ({
          device: d.device,
          value: d.realDataPoints,
          color: STATE_COLORS[d.state] ?? 'var(--primary)',
        })),
    [devices],
  );

  // Freshness: most overdue (oldest last-real-data) first.
  const freshnessRows: BarRow[] = React.useMemo(() => {
    return devices
      .filter((d) => d.lastRealData)
      .sort(
        (a, b) =>
          new Date(a.lastRealData as string).getTime() -
          new Date(b.lastRealData as string).getTime(),
      )
      .slice(0, MAX_BARS)
      .map((d) => ({
        device: d.device,
        value: Math.round(hoursSince(d.lastRealData, now) ?? 0),
        color: STATE_COLORS[d.state] ?? 'var(--primary)',
      }));
  }, [devices, now]);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <HorizontalBarCard
        title={c.perDeviceTitle}
        subtitle={c.perDeviceSubtitle}
        rows={activityRows}
        emptyLabel={c.noData}
        icon={<BarChart3 className="h-4 w-4" />}
      />
      <HorizontalBarCard
        title={c.freshnessTitle}
        subtitle={c.freshnessSubtitle}
        rows={freshnessRows}
        valueSuffix="h"
        emptyLabel={c.noData}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import {
  CircleCheck,
  CircleOff,
  Clock,
  Cpu,
  Database,
  Layers,
  PieChart as PieChartIcon,
  Radio,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import type { DeviceStatus } from '@/generated/graphql';
import { deviceGroup } from '@/lib/hooks/use-device-dashboard';
import { STATE_COLORS, STATE_ORDER } from './device-status-constants';

/** Shared glass-panel styling for the dashboard cards. */
const GLASS =
  'border-border/40 bg-card/50 shadow-lg shadow-black/5 backdrop-blur-md';

interface DeviceStatusSummaryProps {
  devices: DeviceStatus[];
  statusCounts: Record<string, number>;
  totalDevices: number;
  totalRealDataPoints: number;
}

/** Palette for the device-group pie (cycled if there are more groups). */
const GROUP_COLORS = [
  '#016f7c',
  '#0ea5e9',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#14b8a6',
  '#64748b',
];

/** Health color for the working share: green ≥90%, amber ≥50%, else red. */
function shareColor(pct: number): string {
  if (pct >= 90) return STATE_COLORS.working;
  if (pct >= 50) return STATE_COLORS.stale;
  return STATE_COLORS['never-seen'];
}

interface StatBoxProps {
  label: string;
  value: number;
  dotColor: string;
  icon: React.ReactNode;
}

/** Full number for the title; compact (e.g. 5.3M) for the large display. */
const compactFmt = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function StatBox({ label, value, dotColor, icon }: StatBoxProps) {
  // Keep small numbers exact; compact only once they would overflow the box.
  const display =
    value >= 100_000 ? compactFmt.format(value) : value.toLocaleString();
  return (
    <Card
      className={cn(
        GLASS,
        'min-w-0 overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
          <p className="text-muted-foreground truncate text-sm font-medium">
            {label}
          </p>
        </div>
        <span className="text-muted-foreground/50 shrink-0" aria-hidden>
          {icon}
        </span>
      </div>
      <p
        className="mt-2 truncate text-3xl font-bold tracking-tight tabular-nums xl:text-4xl"
        title={value.toLocaleString()}
      >
        {display}
      </p>
    </Card>
  );
}

export function DeviceStatusSummary({
  devices,
  statusCounts,
  totalDevices,
  totalRealDataPoints,
}: DeviceStatusSummaryProps) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;

  const stateLabel: Record<string, string> = {
    working: ds.states.working,
    stale: ds.states.stale,
    'heartbeat-only': ds.states.heartbeatOnly,
    'never-seen': ds.states.neverSeen,
  };

  const stateHint: Record<string, string> = {
    working: ds.stateHints.working,
    stale: ds.stateHints.stale,
    'heartbeat-only': ds.stateHints.heartbeatOnly,
    'never-seen': ds.stateHints.neverSeen,
  };

  const working = statusCounts.working ?? 0;
  const workingPct =
    totalDevices > 0 ? Math.round((working / totalDevices) * 100) : 0;

  // Donut data: states with at least one device, worst-first.
  const donutData = STATE_ORDER.map((state) => ({
    name: stateLabel[state],
    value: statusCounts[state] ?? 0,
    color: STATE_COLORS[state],
  })).filter((d) => d.value > 0);

  // Device-group distribution (Air / Soil / vgreens …), largest first.
  const groupData = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of devices) {
      const g = deviceGroup(d.device);
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        color: GROUP_COLORS[i % GROUP_COLORS.length],
      }));
  }, [devices]);

  const stateIcon: Record<string, React.ReactNode> = {
    working: <CircleCheck className="h-4 w-4" />,
    stale: <Clock className="h-4 w-4" />,
    'heartbeat-only': <Radio className="h-4 w-4" />,
    'never-seen': <CircleOff className="h-4 w-4" />,
  };

  const boxes: StatBoxProps[] = [
    {
      label: ds.summary.totalDevices,
      value: totalDevices,
      dotColor: 'var(--primary)',
      icon: <Cpu className="h-4 w-4" />,
    },
    ...STATE_ORDER.map((state) => ({
      label: stateLabel[state],
      value: statusCounts[state] ?? 0,
      dotColor: STATE_COLORS[state],
      icon: stateIcon[state],
    })),
    {
      label: ds.summary.dataPoints,
      value: totalRealDataPoints,
      dotColor: 'var(--primary)',
      icon: <Database className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Stat boxes — six metrics, scaling up to one row on wide screens. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {boxes.map((box) => (
          <StatBox key={box.label} {...box} />
        ))}
      </div>

      {/* Distribution charts: status (left) + device groups (right). */}
      <Card className={GLASS}>
        <CardContent className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:gap-10">
          {/* Status distribution */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <PieChartIcon className="text-muted-foreground h-4 w-4" />
                {ds.summary.statusDistribution}
              </span>
              <span className="text-muted-foreground text-xs">
                {ds.summary.activeShare
                  .replace('{n}', String(working))
                  .replace('{total}', String(totalDevices))}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative shrink-0">
                {donutData.length === 0 ? (
                  <div className="text-muted-foreground flex h-[180px] w-[180px] items-center justify-center text-sm">
                    {ds.charts.noData}
                  </div>
                ) : (
                  <>
                    <ChartContainer config={{}} className="h-[180px] w-[180px]">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={86}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {donutData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="text-3xl font-bold tabular-nums"
                        style={{ color: shareColor(workingPct) }}
                      >
                        {workingPct}%
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {ds.states.working}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                {STATE_ORDER.map((state) => (
                  <div key={state} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: STATE_COLORS[state] }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {stateLabel[state]}
                        </span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          · {(statusCounts[state] ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-snug">
                        {stateHint[state]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device groups */}
          <div className="flex min-w-0 flex-col gap-4 lg:border-l lg:pl-10">
            <div className="flex flex-col gap-0.5">
              <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Layers className="text-muted-foreground h-4 w-4" />
                {ds.summary.byGroup}
              </span>
              <span className="text-muted-foreground text-xs">
                {ds.summary.groupCount.replace('{n}', String(groupData.length))}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="shrink-0">
                {groupData.length === 0 ? (
                  <div className="text-muted-foreground flex h-[180px] w-[180px] items-center justify-center text-sm">
                    {ds.charts.noData}
                  </div>
                ) : (
                  <ChartContainer config={{}} className="h-[180px] w-[180px]">
                    <PieChart>
                      <Pie
                        data={groupData}
                        cx="50%"
                        cy="50%"
                        outerRadius={86}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {groupData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                )}
              </div>

              <div className="flex max-h-[180px] min-w-0 flex-1 flex-col gap-2 overflow-y-auto">
                {groupData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                      aria-hidden
                    />
                    <span className="text-foreground min-w-0 flex-1 truncate text-sm">
                      {entry.name}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

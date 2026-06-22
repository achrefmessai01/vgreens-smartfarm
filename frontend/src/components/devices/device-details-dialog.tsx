'use client';

import * as React from 'react';
import { Cpu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import type { DeviceStatus } from '@/generated/graphql';
import { STATE_BADGE_CLASS } from './device-status-constants';

interface DeviceDetailsDialogProps {
  device: DeviceStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fmtNum(v: number) {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function DeviceDetailsDialog({
  device,
  open,
  onOpenChange,
}: DeviceDetailsDialogProps) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;
  const tbl = ds.table;

  const stateLabel = React.useCallback(
    (state: string) =>
      ({
        working: ds.states.working,
        stale: ds.states.stale,
        'heartbeat-only': ds.states.heartbeatOnly,
        'never-seen': ds.states.neverSeen,
      })[state] ?? state,
    [ds.states],
  );

  const formatFull = React.useCallback(
    (iso?: string | null) => {
      if (!iso) return tbl.never;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return tbl.never;
      const abs = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
      const diffMin = Math.max(0, (Date.now() - d.getTime()) / 60_000);
      let rel: string;
      if (diffMin < 1) rel = ds.relative.justNow;
      else if (diffMin < 60)
        rel = ds.relative.minutesAgo.replace(
          '{n}',
          String(Math.round(diffMin)),
        );
      else if (diffMin < 2880)
        rel = ds.relative.hoursAgo.replace(
          '{n}',
          String(Math.round(diffMin / 60)),
        );
      else
        rel = ds.relative.daysAgo.replace(
          '{n}',
          String(Math.round(diffMin / 1440)),
        );
      return `${abs} · ${rel}`;
    },
    [ds.relative, tbl.never],
  );

  if (!device) return null;

  const connectivity =
    device.online == null
      ? ds.details.unknown
      : device.online
        ? ds.details.online
        : ds.details.offline;

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: tbl.columns.class,
      value: device.deviceClass === 'edge' ? tbl.classEdge : tbl.classRegular,
    },
    { label: ds.details.connectivity, value: connectivity },
    { label: tbl.columns.lastAlive, value: formatFull(device.lastAlive) },
    { label: tbl.columns.lastRealData, value: formatFull(device.lastRealData) },
    {
      label: tbl.columns.realPoints,
      value: device.realDataPoints.toLocaleString(),
    },
    {
      label: tbl.columns.heartbeatPoints,
      value: device.heartbeatDataPoints.toLocaleString(),
    },
    {
      label: tbl.columns.messageTypes,
      value: device.realMessageTypes.length
        ? device.realMessageTypes.join(', ')
        : tbl.none,
    },
    { label: tbl.columns.greenhouse, value: device.greenhouse ?? tbl.none },
    {
      label: tbl.columns.position,
      value:
        device.xPosition != null && device.yPosition != null
          ? `${device.xPosition}, ${device.yPosition}`
          : tbl.none,
    },
    { label: tbl.columns.city, value: device.city ?? tbl.none },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/80 max-h-[calc(100vh-2rem)] overflow-y-auto backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Cpu className="h-5 w-5 shrink-0" />
            <span className="truncate">{device.device}</span>
            <Badge
              variant="outline"
              className={cn(
                'ml-1 font-medium',
                STATE_BADGE_CLASS[device.state],
              )}
            >
              {stateLabel(device.state)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground text-xs font-medium">
                {row.label}
              </dt>
              <dd className="text-foreground text-sm break-words">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-2">
          <p className="text-foreground mb-2 text-sm font-semibold">
            {ds.details.latestValues}
          </p>
          {device.lastValues.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {ds.details.noValues}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {device.lastValues.map((v) => (
                <div
                  key={v.field}
                  className="border-border/60 bg-muted/30 flex flex-col rounded-lg border px-3 py-2"
                >
                  <span className="text-muted-foreground truncate text-xs">
                    {v.field}
                  </span>
                  <span className="text-foreground text-lg font-semibold tabular-nums">
                    {fmtNum(v.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

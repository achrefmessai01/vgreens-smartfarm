'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

interface DeviceRefreshControlProps {
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  onReload: () => void;
  loading?: boolean;
}

const INTERVALS_MS = [0, 30_000, 60_000, 300_000, 900_000];

/** Manual reload button + auto-refresh interval picker. */
export function DeviceRefreshControl({
  intervalMs,
  onIntervalChange,
  onReload,
  loading,
}: DeviceRefreshControlProps) {
  const { t } = useI18n();
  const r = t.pages.deviceStatus.refresh;

  const intervalLabel = (ms: number) =>
    ms === 0
      ? r.off
      : ms < 60_000
        ? `${ms / 1000}s`
        : `${ms / 60_000}m`;

  return (
    <div className="flex items-end gap-2">
      <Button
        type="button"
        size="icon"
        className="group h-9 w-9 overflow-hidden bg-gradient-to-br from-[#016f7c] to-[#015862] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        onClick={onReload}
        aria-label={r.reload}
        title={r.reload}
      >
        <RefreshCw
          className={cn(
            'h-4 w-4 transition-transform duration-500 group-hover:rotate-180',
            loading && 'animate-spin',
          )}
        />
      </Button>
      <Select
        value={String(intervalMs)}
        onValueChange={(v) => onIntervalChange(Number(v))}
      >
        <SelectTrigger
          className="h-9 w-28 bg-card/60 backdrop-blur-sm"
          aria-label={r.auto}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INTERVALS_MS.map((ms) => (
            <SelectItem key={ms} value={String(ms)} className="text-sm">
              <RefreshCw
                className="text-muted-foreground h-3.5 w-3.5"
                aria-hidden
              />
              <span>{intervalLabel(ms)}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

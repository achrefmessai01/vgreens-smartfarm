'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { TunnelStatus } from '@/types/tunnel.types';

interface SensorTileProps {
  label: string;
  value: string | number;
  unit?: string;
  status: TunnelStatus;
  className?: string;
}

export function SensorTile({
  label,
  value,
  unit,
  status,
  className,
}: SensorTileProps) {
  const statusConfig = {
    normal: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      border: 'border-green-500/30 dark:border-green-500/40',
      dot: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
    },
    warning: {
      bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      border: 'border-yellow-500/30 dark:border-yellow-500/40',
      dot: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    critical: {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      border: 'border-red-500/30 dark:border-red-500/40',
      dot: 'bg-red-500',
      text: 'text-red-700 dark:text-red-400',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-3 transition-all',
        config.bg,
        config.border,
        className,
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-muted-foreground dark:text-muted-foreground/80 text-xs font-medium">
          {label}
        </p>
        <div
          className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', config.dot)}
        />
      </div>
      <p className={cn('text-lg font-semibold', config.text)}>
        {value}
        {unit && <span className="ml-1 text-sm">{unit}</span>}
      </p>
    </div>
  );
}

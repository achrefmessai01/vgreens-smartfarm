'use client';

import {
  getDisplayUnit,
  getParameterStatus,
  formatParameterValue,
} from '@/lib/parameter-status';
import { cn } from '@/lib/utils';
import { ParameterIcon } from '@/lib/parameter-icon';
import type { ParameterStatus } from '@/lib/parameter-status';

export interface ParameterRowProps {
  parameterKey: string;
  parameterLabel: string;
  value: number | null;
  onClick?: () => void;
}

export function ParameterRow({
  parameterKey,
  parameterLabel,
  value,
  onClick,
}: ParameterRowProps) {
  const status: ParameterStatus = getParameterStatus(parameterKey, value);
  const unit = getDisplayUnit(parameterKey);

  const textColor =
    status === 'normal'
      ? 'text-emerald-600 dark:text-emerald-400'
      : status === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : status === 'critical'
      ? 'text-destructive'
      : 'text-muted-foreground';

  const dotColor =
    status === 'normal'
      ? 'bg-emerald-500'
      : status === 'warning'
      ? 'bg-amber-400'
      : status === 'critical'
      ? 'bg-destructive'
      : 'bg-slate-500';

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-1.5 mx-1 my-0.5 rounded-md transition-all duration-300 ease-out',
        'bg-gradient-to-r from-background to-background/95 border border-border/60',
        'shadow-sm hover:shadow-md active:shadow-lg',
        'transform hover:scale-[1.01] active:scale-[0.99]',
        onClick && 'cursor-pointer hover:bg-gradient-to-r hover:from-muted/20 hover:to-muted/10 active:from-muted/30 active:to-muted/20',
      )}
      onClick={onClick}
      style={{
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <ParameterIcon
          parameterKey={parameterKey}
          className="h-4 w-4 shrink-0 text-muted-foreground/80"
        />
        <span className={cn('inline-block h-2 w-2 rounded-full shrink-0 shadow-sm', dotColor)} />
        <span className="truncate text-sm font-semibold text-foreground">
          {parameterLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="rounded-full px-2.5 py-1 text-sm font-semibold bg-white/60 dark:bg-gray-900/60 border border-border/30 shadow-sm">
          <span className={cn('tabular-nums', textColor)}>
            {formatParameterValue(value)}
          </span>
          {unit && <span className="ml-1.5 text-xs font-normal opacity-70 text-muted-foreground">{unit}</span>}
        </div>
        <svg
          className="h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

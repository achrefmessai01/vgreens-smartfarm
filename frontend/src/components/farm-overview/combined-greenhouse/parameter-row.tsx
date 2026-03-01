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
  isLast?: boolean;
}

export function ParameterRow({
  parameterKey,
  parameterLabel,
  value,
  isLast,
}: ParameterRowProps) {
  const status: ParameterStatus = getParameterStatus(parameterKey, value);
  const unit = getDisplayUnit(parameterKey);

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 sm:gap-1.5 md:gap-2 lg:gap-2.5 px-3 sm:px-2 md:px-2.5 lg:px-3 py-1.5 sm:py-1 lg:py-1.5 transition-colors duration-700 ease-out',
        !isLast && 'border-b border-border/35',
        status === 'normal' &&
          'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
        status === 'warning' &&
          'bg-amber-500/20 text-amber-800 dark:text-amber-300',
        status === 'critical' && 'bg-destructive/20 text-destructive',
        status === 'no-data' && 'bg-muted/30 text-muted-foreground',
      )}
    >
      <ParameterIcon
        parameterKey={parameterKey}
        className="h-5 w-5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 shrink-0"
      />
      <div className="flex flex-wrap items-baseline justify-start text-left gap-x-1 sm:gap-x-1.5 gap-y-0.5 tabular-nums min-w-0">
        <span className="text-2xl sm:text-sm md:text-base lg:text-xl xl:text-2xl leading-none">
          {formatParameterValue(value)}
        </span>
        {unit && (
          <span className="text-sm sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs/none opacity-85 break-all">
            {unit}
          </span>
        )}
      </div>
      <span className="sr-only">{parameterLabel}</span>
    </div>
  );
}

'use client';

import type { Bay } from '@/lib/farm-types';
import { ParameterRow } from './parameter-row';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAverageParameterValue } from '@/lib/bay-parameter-utils';
import { getParameterStatus } from '@/lib/parameter-status';

export interface ParameterOption {
  label: string;
  value: string;
}

export interface GreenhouseSummaryCardProps {
  title: string;
  bay: Bay | null;
  parameters: ParameterOption[];
  noDataMessage: string;
  valueOverride?: (parameterKey: string) => number | null | undefined;
  onParameterClick?: (parameterKey: string) => void;
}

export function GreenhouseSummaryCard({
  title,
  bay,
  parameters,
  noDataMessage,
  valueOverride,
  onParameterClick,
}: GreenhouseSummaryCardProps) {
  const criticalCount = parameters.reduce((acc, p) => {
    const val = valueOverride?.(p.value) ?? getAverageParameterValue(bay, p.value);
    const status = getParameterStatus(p.value, val);
    return acc + (status === 'critical' ? 1 : 0);
  }, 0);
  return (
    <Card className="w-full gap-0 py-0 overflow-hidden rounded-lg transition-shadow duration-700 ease-out hover:shadow-md bg-card/80">
      <div className="flex items-center gap-3 border-b border-border/50 bg-muted/15 px-3 py-2 sm:px-2 sm:py-1.5 lg:py-2">
        <CardTitle className="break-words text-xs font-semibold uppercase tracking-[0.12em] text-foreground/90 sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm">
          {title}
        </CardTitle>
        {criticalCount > 0 && (
          <div className="ml-auto mr-1 flex items-center">
            <span className="inline-flex items-center rounded-full bg-destructive/90 px-2 py-0.5 text-xs font-medium text-white">
              {criticalCount} critical
            </span>
          </div>
        )}
      </div>
      {!bay && (
        <p className="px-6 py-3 text-xs text-muted-foreground border-b border-border/40">
          {noDataMessage}
        </p>
      )}
      <CardContent className="p-1 space-y-0.5">
        {parameters.map((parameter) => (
          <ParameterRow
            key={parameter.value}
            parameterKey={parameter.value}
            parameterLabel={parameter.label}
            value={
              valueOverride?.(parameter.value) ??
              getAverageParameterValue(bay, parameter.value)
            }
            onClick={onParameterClick ? () => onParameterClick(parameter.value) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}

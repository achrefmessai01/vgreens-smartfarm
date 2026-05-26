'use client';

import type { Bay } from '@/types/farm.types';
import { ParameterRow } from './parameter-row';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  const criticalCount = parameters.reduce((acc, p) => {
    const val =
      valueOverride?.(p.value) ?? getAverageParameterValue(bay, p.value);
    const status = getParameterStatus(p.value, val);
    return acc + (status === 'critical' ? 1 : 0);
  }, 0);
  return (
    <Card className="bg-card/80 w-full gap-0 overflow-hidden rounded-lg py-0 transition-shadow duration-700 ease-out hover:shadow-md">
      <div className="border-border/50 bg-muted/15 flex items-center gap-3 border-b px-3 py-2 sm:px-2 sm:py-1.5 lg:py-2">
        <CardTitle className="text-foreground/90 text-xs font-semibold tracking-[0.12em] break-words uppercase sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm">
          {title}
        </CardTitle>
        {criticalCount > 0 && (
          <div className="mr-1 ml-auto flex items-center">
            <span className="bg-destructive/90 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white">
              {criticalCount} {t.pages.farmOverview.criticalSuffix}
            </span>
          </div>
        )}
      </div>
      {!bay && (
        <p className="text-muted-foreground border-border/40 border-b px-6 py-3 text-xs">
          {noDataMessage}
        </p>
      )}
      <CardContent className="space-y-0.5 p-1">
        {parameters.map((parameter) => (
          <ParameterRow
            key={parameter.value}
            parameterKey={parameter.value}
            parameterLabel={parameter.label}
            value={
              valueOverride?.(parameter.value) ??
              getAverageParameterValue(bay, parameter.value)
            }
            onClick={
              onParameterClick
                ? () => onParameterClick(parameter.value)
                : undefined
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

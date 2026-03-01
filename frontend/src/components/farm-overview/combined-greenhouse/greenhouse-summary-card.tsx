'use client';

import type { Bay } from '@/lib/farm-types';
import { ParameterRow } from './parameter-row';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAverageParameterValue } from '@/lib/bay-parameter-utils';

export interface ParameterOption {
  label: string;
  value: string;
}

export interface GreenhouseSummaryCardProps {
  title: string;
  bay: Bay | null;
  parameters: ParameterOption[];
  noDataMessage: string;
}

export function GreenhouseSummaryCard({
  title,
  bay,
  parameters,
  noDataMessage,
}: GreenhouseSummaryCardProps) {
  return (
    <Card className="w-full gap-0 py-0 overflow-hidden rounded-sm transition-shadow duration-700 ease-out hover:shadow-md">
      <div className="border-b border-border/50 bg-muted/20 px-3 py-1.5 sm:px-2 sm:py-1.5 lg:py-2">
        <CardTitle className="text-sm sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm font-semibold uppercase tracking-wider text-foreground/90">
          {title}
        </CardTitle>
      </div>
      {!bay && (
        <p className="px-6 py-3 text-xs text-muted-foreground border-b border-border/40">
          {noDataMessage}
        </p>
      )}
      <CardContent className="p-0">
        {parameters.map((parameter, index) => (
          <ParameterRow
            key={parameter.value}
            parameterKey={parameter.value}
            parameterLabel={parameter.label}
            value={getAverageParameterValue(bay, parameter.value)}
            isLast={index === parameters.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import {
  type ParameterOption,
  GreenhouseSummaryCard,
} from './greenhouse-summary-card';
import { Card } from '@/components/ui/card';
import type { Bay } from '@/lib/farm-types';
import { PARAMETER_PRIORITY } from '@/lib/parameter-status';

export interface CombinedGreenhouse {
  key: string;
  label: string;
  bay: Bay | null;
}

export interface CombinedGreenhouseViewProps {
  greenhouses: CombinedGreenhouse[];
  parameters: ParameterOption[];
  noDataMessage: string;
}

function orderParameters(parameters: ParameterOption[]): ParameterOption[] {
  const uniqueByValue = new Map<string, ParameterOption>();
  for (const option of parameters) {
    if (!uniqueByValue.has(option.value))
      uniqueByValue.set(option.value, option);
  }
  const priorityByField = new Map(
    PARAMETER_PRIORITY.map((field, i) => [field, i]),
  );
  return Array.from(uniqueByValue.values()).sort((a, b) => {
    const aP = priorityByField.get(a.value) ?? Number.MAX_SAFE_INTEGER;
    const bP = priorityByField.get(b.value) ?? Number.MAX_SAFE_INTEGER;
    if (aP !== bP) return aP - bP;
    return a.label.localeCompare(b.label);
  });
}

export function CombinedGreenhouseView({
  greenhouses,
  parameters,
  noDataMessage,
}: CombinedGreenhouseViewProps) {
  const orderedParameters = React.useMemo(
    () => orderParameters(parameters),
    [parameters],
  );

  if (orderedParameters.length === 0) {
    return (
      <Card className="h-full min-h-0 flex items-center justify-center p-6 rounded-sm">
        <p className="text-sm text-muted-foreground">{noDataMessage}</p>
      </Card>
    );
  }

  if (greenhouses.length === 0) {
    return (
      <Card className="h-full min-h-0 flex items-center justify-center p-6 rounded-sm">
        <p className="text-sm text-muted-foreground">{noDataMessage}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))] gap-1 sm:gap-2 pb-1 items-stretch content-start">
      {greenhouses.map((greenhouse) => (
        <GreenhouseSummaryCard
          key={greenhouse.key}
          title={greenhouse.label}
          bay={greenhouse.bay}
          parameters={orderedParameters}
          noDataMessage={noDataMessage}
        />
      ))}
    </div>
  );
}

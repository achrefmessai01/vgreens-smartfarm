'use client';

import * as React from 'react';
import {
  type ParameterOption,
  GreenhouseSummaryCard,
} from './greenhouse-summary-card';
import { Card } from '@/components/ui/card';
import type { Bay } from '@/types/farm.types';
import { PARAMETER_PRIORITY } from '@/lib/parameter-status';
import { ParGraphSection } from '@/components/farm-overview';
import { getAverageParameterValue } from '@/lib/bay-parameter-utils';

export interface CombinedGreenhouse {
  key: string;
  label: string;
  bay: Bay | null;
}

export interface CombinedGreenhouseViewProps {
  greenhouses: CombinedGreenhouse[];
  parameters: ParameterOption[];
  noDataMessage: string;
  parGraphGreenhouseId: string;
  parGraphLabel: string;
  /** Optional bucket override forwarded to the embedded PAR graph. Required
   *  when a vGreens admin views another tenant. */
  parGraphBucketName?: string | null;
  onParameterClick?: (greenhouseIndex: number, parameterKey: string) => void;
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
  parGraphGreenhouseId,
  parGraphLabel,
  parGraphBucketName,
  onParameterClick,
}: CombinedGreenhouseViewProps) {
  const orderedParameters = React.useMemo(
    () => orderParameters(parameters),
    [parameters],
  );

  const sharedParValue = React.useMemo(() => {
    const referenceBay = greenhouses[0]?.bay ?? greenhouses[1]?.bay ?? null;
    if (!referenceBay) return null;
    // Use whichever PAR-like field is present in parameters
    const parKey =
      orderedParameters.find(
        (p) => p.value === 'par' || p.value === 'par_estimated',
      )?.value ?? 'par';
    return getAverageParameterValue(referenceBay, parKey);
  }, [greenhouses, orderedParameters]);

  const valueOverride = React.useCallback(
    (parameterKey: string) => {
      if (parameterKey === 'par' || parameterKey === 'par_estimated') {
        return sharedParValue;
      }
      return null;
    },
    [sharedParValue],
  );

  if (orderedParameters.length === 0 || greenhouses.length === 0) {
    return (
      <Card className="flex h-full min-h-0 items-center justify-center rounded-sm p-6">
        <p className="text-muted-foreground text-sm">{noDataMessage}</p>
      </Card>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 content-start items-stretch gap-1 pb-1 sm:grid-cols-2 sm:gap-2 xl:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))]">
        {greenhouses.map((greenhouse, index) => (
          <GreenhouseSummaryCard
            key={greenhouse.key}
            title={greenhouse.label}
            bay={greenhouse.bay}
            parameters={orderedParameters}
            noDataMessage={noDataMessage}
            valueOverride={valueOverride}
            onParameterClick={
              onParameterClick
                ? (parameterKey) => onParameterClick(index, parameterKey)
                : undefined
            }
          />
        ))}
      </div>

      <ParGraphSection
        bay={null}
        greenhouseId={parGraphGreenhouseId}
        greenhouseLabel={parGraphLabel}
        bucketName={parGraphBucketName}
        embedded
        className="min-h-[15rem] w-full shrink-0 sm:min-h-[17rem] md:min-h-[20rem] lg:min-h-[24rem]"
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { computeAvgBrix, computeAvgBrixByClass } from '@/lib/harvest-utils';
import { HarvestQualityClass } from '@/generated/graphql';
import type { BrixMeasurementsFieldProps } from '@/types/batch-sidebar.types';
import { BrixReadingRow } from './batch-sidebar-brix-row';

export function BrixMeasurementsField({
  readings,
  classes,
  showBrix,
  onShowBrixChange,
  onReadingChange,
  onClassChange,
  onAddReading,
  onRemoveReading,
  idPrefix = '',
  isLoading = false,
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const handleEnter = (currentIndex: number) => {
    inputRefs.current[currentIndex + 1]?.focus();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const brixLabel = h?.brixLabel ?? 'Brix';
  const avgBrix = computeAvgBrix(readings);
  const avgByClass = computeAvgBrixByClass(readings, classes);
  // Only classes with at least one populated reading show up — a stub row for
  // an unused class would just add "0.0°Bx" noise.
  const perClassAverages: Array<{ cls: HarvestQualityClass; value: number }> = (
    [HarvestQualityClass.A, HarvestQualityClass.B, HarvestQualityClass.C] as const
  )
    .map((cls) => ({ cls, value: avgByClass[cls] }))
    .filter((entry) => entry.value > 0);
  const canRemove = readings.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          {h?.qualityMetrics ?? 'Quality Metrics'}
        </p>
        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm select-none">
          <Checkbox
            checked={showBrix}
            onCheckedChange={(checked) => onShowBrixChange(checked === true)}
          />
          <span>{h?.addBrixMeasurements ?? 'Add Brix measurements'}</span>
        </label>
      </div>
      {showBrix && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">
                {h?.brixMeasurements ?? 'Brix Measurements'}
              </p>
              <span className="text-muted-foreground text-sm">
                {h?.average ?? 'Average'}:{' '}
                <span className="text-lg font-medium text-orange-500">
                  {avgBrix > 0 ? avgBrix.toFixed(1) : '0.0'}&deg;Bx
                </span>
              </span>
            </div>
            {perClassAverages.length > 0 && (
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs sm:justify-end">
                {perClassAverages.map(({ cls, value }) => (
                  <span key={cls}>
                    {(h?.averageByClass ?? 'Avg {class}').replace(
                      '{class}',
                      cls,
                    )}
                    :{' '}
                    <span className="text-foreground font-medium">
                      {value.toFixed(1)}&deg;Bx
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {readings.map((value, index) => (
              <BrixReadingRow
                key={index}
                index={index}
                value={value}
                brixClass={classes[index] ?? HarvestQualityClass.A}
                brixLabel={brixLabel}
                idPrefix={idPrefix}
                isLoading={isLoading}
                canRemove={canRemove}
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                }}
                onValueChange={(i, v) => onReadingChange?.(i, v)}
                onClassChange={(i, v) => onClassChange?.(i, v)}
                onRemove={(i) => onRemoveReading?.(i)}
                onEnter={handleEnter}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddReading?.()}
              disabled={isLoading}
              className="w-full"
            >
              <Plus className="mr-1 h-4 w-4" />
              {h?.addBrixReading ?? 'Add Brix reading'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { computeAvgBrix } from '@/lib/harvest-utils';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import type { BrixMeasurementsFieldProps } from '@/types/batch-sidebar.types';

export function BrixMeasurementsField({
  measurements,
  onMeasurementChange,
  isLoading = false,
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>(
    Array(10).fill(null),
  );

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRefs.current[currentIndex + 1]?.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted h-4 animate-pulse rounded" />
              <div className="bg-muted h-10 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const brixLabel = h?.brixLabel ?? 'Brix';
  const brixEntries = Array.from({ length: 10 }, (_, i) => ({
    label: `${brixLabel} ${i + 1}`,
    field: `brix${i + 1}` as keyof typeof measurements,
    value: measurements[`brix${i + 1}` as keyof typeof measurements],
    placeholder: `${h?.enterBrixValue ?? 'Enter Brix value'} ${i + 1}`,
  }));

  const avgBrix = computeAvgBrix(measurements);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm font-medium">
        {h?.qualityMetrics ?? 'Quality Metrics'}
      </p>
      <div className="space-y-4">
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {brixEntries.map((entry, index) => (
            <Field key={index}>
              <FieldLabel htmlFor={`brix-${index + 1}`}>
                {entry.label}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`brix-${index + 1}`}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={entry.value === 0 ? '' : entry.value.toString()}
                  onChange={(e) =>
                    onMeasurementChange?.(
                      entry.field,
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={entry.placeholder}
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}

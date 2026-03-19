'use client';

import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import * as React from 'react';
import type { BrixMeasurementsFieldProps } from '../batch-sidebar-types';

export function BrixMeasurementsField({
  measurements,
  onMeasurementChange,
  isLoading = false,
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex + 1 < 10) {
        document.getElementById(`brix-${currentIndex + 2}`)?.focus();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
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

  const brixValues = Object.values(measurements).filter((v) => v > 0);
  const avgBrix =
    brixValues.length > 0
      ? brixValues.reduce((sum, val) => sum + val, 0) / brixValues.length
      : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium">
        {h?.qualityMetrics ?? 'Quality Metrics'}
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {h?.brixMeasurements ?? 'Brix Measurements'}
          </p>
          <span className="text-sm text-muted-foreground">
            {h?.average ?? 'Average'}:{' '}
            <span className="text-lg text-orange-500 font-medium">
              {avgBrix > 0 ? avgBrix.toFixed(1) : '0.0'}°Bx
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {brixEntries.map((entry, index) => (
            <Field key={index}>
              <FieldLabel htmlFor={`brix-${index + 1}`}>
                {entry.label}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`brix-${index + 1}`}
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

'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { computeAvgBrix } from '@/lib/harvest-utils';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import type { BrixMeasurementsFieldProps } from '@/types/batch-sidebar.types';

export function BrixMeasurementsField({
  readings,
  showBrix,
  onShowBrixChange,
  onReadingChange,
  onAddReading,
  onRemoveReading,
  idPrefix = '',
  isLoading = false,
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

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
          <div className="space-y-2">
            {readings.map((value, index) => (
              <Field key={index}>
                <FieldLabel htmlFor={`${idPrefix}brix-${index + 1}`}>
                  {brixLabel} {index + 1}
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${idPrefix}brix-${index + 1}`}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        value={value === 0 ? '' : value.toString()}
                        onChange={(e) =>
                          onReadingChange?.(
                            index,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder={`${h?.enterBrixValue ?? 'Enter Brix value'} ${index + 1}`}
                        disabled={isLoading}
                        className="pr-12"
                      />
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                        &deg;Bx
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0"
                      onClick={() => onRemoveReading?.(index)}
                      disabled={isLoading || !canRemove}
                      aria-label={h?.removeReading ?? 'Remove reading'}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </FieldContent>
              </Field>
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

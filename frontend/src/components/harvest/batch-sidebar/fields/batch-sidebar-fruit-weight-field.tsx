'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DecimalInput } from '@/components/ui/decimal-input';
import { computeAvgFruitWeight } from '@/lib/harvest-utils';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import type { FruitWeightFieldProps } from '@/types/batch-sidebar.types';

export function FruitWeightField({
  sampleWeight,
  sampleFruitCount,
  showFruitWeight,
  onShowFruitWeightChange,
  onSampleWeightChange,
  onSampleFruitCountChange,
  idPrefix = '',
  isLoading = false,
}: FruitWeightFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
      </div>
    );
  }

  // Average fruit weight (g/fruit), derived from a weighed sample rather than by
  // counting every fruit: sampleWeight (grams) / sampleFruitCount.
  const avgFruitWeight = computeAvgFruitWeight(sampleFruitCount, sampleWeight);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          {h?.fruitWeightMeasurement ?? 'Fruit Weight'}
        </p>
        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm select-none">
          <Checkbox
            checked={showFruitWeight}
            onCheckedChange={(checked) =>
              onShowFruitWeightChange(checked === true)
            }
          />
          <span>{h?.addFruitWeight ?? 'Add fruit weight measurement'}</span>
        </label>
      </div>
      {showFruitWeight && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {h?.fruitWeightSample ?? 'Fruit weight sample'}
            </p>
            <span className="text-muted-foreground text-sm">
              {h?.averageFruitWeight ?? 'Average Fruit Weight'}:{' '}
              <span className="text-lg font-medium text-orange-500">
                {avgFruitWeight > 0 ? avgFruitWeight.toFixed(1) : '0.0'} g
              </span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${idPrefix}sample-weight`}>
                {h?.sampleWeight ?? 'Sample weight (g)'}
              </FieldLabel>
              <FieldContent>
                <DecimalInput
                  id={`${idPrefix}sample-weight`}
                  value={sampleWeight}
                  onChange={(value) => onSampleWeightChange?.(value)}
                  placeholder={h?.enterSampleWeight ?? 'Enter sample weight'}
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${idPrefix}sample-fruit-count`}>
                {h?.sampleFruitCount ?? 'Fruits in sample'}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`${idPrefix}sample-fruit-count`}
                  type="number"
                  min="0"
                  step="1"
                  value={
                    sampleFruitCount === 0 ? '' : sampleFruitCount.toString()
                  }
                  onChange={(e) =>
                    onSampleFruitCountChange?.(
                      Math.max(0, Math.trunc(parseFloat(e.target.value) || 0)),
                    )
                  }
                  placeholder={
                    h?.enterSampleFruitCount ?? 'Enter number of fruits'
                  }
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

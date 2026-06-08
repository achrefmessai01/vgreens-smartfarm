'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { computeAvgFruitWeight } from '@/lib/harvest-utils';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import type { FruitWeightFieldProps } from '@/types/batch-sidebar.types';

export function FruitWeightField({
  fruitCount,
  marketable,
  classB,
  classC,
  showFruitWeight,
  onShowFruitWeightChange,
  onFruitCountChange,
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

  // Total fruit weight is the sellable yield (Class A + Class B + Class C)
  // entered above. Each one defaults to 0, so any subset is sufficient.
  const totalFruitWeight = (marketable || 0) + (classB || 0) + (classC || 0);
  const avgFruitWeight = computeAvgFruitWeight(fruitCount, totalFruitWeight);

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
              {h?.fruitWeightMeasurement ?? 'Fruit Weight'}
            </p>
            <span className="text-muted-foreground text-sm">
              {h?.averageFruitWeight ?? 'Average Fruit Weight'}:{' '}
              <span className="text-lg font-medium text-orange-500">
                {avgFruitWeight > 0 ? avgFruitWeight.toFixed(3) : '0.000'} kg
              </span>
            </span>
          </div>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}fruit-count`}>
              {h?.fruitCount ?? 'Fruit count'}
            </FieldLabel>
            <FieldContent>
              <Input
                id={`${idPrefix}fruit-count`}
                type="number"
                min="0"
                step="1"
                value={fruitCount === 0 ? '' : fruitCount.toString()}
                onChange={(e) =>
                  onFruitCountChange?.(
                    Math.max(0, Math.trunc(parseFloat(e.target.value) || 0)),
                  )
                }
                placeholder={h?.enterFruitCount ?? 'Enter fruit count'}
                disabled={isLoading}
              />
            </FieldContent>
          </Field>
        </div>
      )}
    </div>
  );
}

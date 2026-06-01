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
  totalFruitWeight,
  showFruitWeight,
  onShowFruitWeightChange,
  onFruitCountChange,
  onTotalFruitWeightChange,
  isLoading = false,
}: FruitWeightFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="fruit-count">
                {h?.fruitCount ?? 'Fruit count'}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fruit-count"
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
            <Field>
              <FieldLabel htmlFor="total-fruit-weight">
                {h?.totalWeight ?? 'Total weight'}
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="total-fruit-weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      totalFruitWeight === 0 ? '' : totalFruitWeight.toString()
                    }
                    onChange={(e) =>
                      onTotalFruitWeightChange?.(
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    placeholder={h?.enterTotalWeight ?? 'Enter total weight'}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                    kg
                  </span>
                </div>
              </FieldContent>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

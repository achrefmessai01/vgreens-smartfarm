'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CrateYieldFieldProps } from '@/types/batch-sidebar.types';
import {
  classLetter,
  crateClassKg,
  crateEntryTotalKg,
} from '@/lib/harvest-utils';

export function CrateYieldField({
  crateCounts,
  remainingKgs,
  waste,
  crateWeight,
  onCrateChange,
  isLoading = false,
}: CrateYieldFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const weight = crateWeight ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
      </div>
    );
  }

  const total = crateEntryTotalKg(crateCounts, remainingKgs, crateWeight);
  const crateUnit = h?.cratesUnit ?? 'crates';
  const remainingKgLabel = h?.remainingKg ?? 'Remaining (kg)';
  const classLabelTpl = h?.qualityClassLabel ?? 'Quality {class}';
  const remainderWarning = (
    h?.remainingKgExceedsCrate ??
    'At/above one full crate ({weight} kg) — count another crate?'
  ).replace('{weight}', String(weight));
  const canRemove = crateCounts.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          {h?.crateYieldData ?? 'Crate Yield'}
        </p>
        <span className="text-muted-foreground text-xs">
          {(h?.crateWeightLabel ?? 'Crate weight: {weight} kg').replace(
            '{weight}',
            String(weight),
          )}
        </span>
      </div>

      <div className="space-y-3">
        {crateCounts.map((count, i) => {
          const remainder = remainingKgs[i] ?? 0;
          const kg = crateClassKg(count, remainder, crateWeight);
          const overRemainder = weight > 0 && remainder >= weight;
          return (
            <div key={i} className="space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">
                  {classLabelTpl.replace('{class}', classLetter(i))}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-teal-600">
                    {kg.toFixed(1)} kg
                  </span>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() =>
                        onCrateChange?.({ kind: 'removeClass', index: i })
                      }
                      aria-label={h?.removeQualityClass ?? 'Remove class'}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={count === 0 ? '' : count.toString()}
                    onChange={(e) =>
                      onCrateChange?.({
                        kind: 'crateCount',
                        index: i,
                        value: Math.max(
                          0,
                          Math.trunc(parseFloat(e.target.value) || 0),
                        ),
                      })
                    }
                    className="h-10 pr-14 text-left text-base"
                    placeholder={h?.enterCrateCount ?? 'Crates'}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    {crateUnit}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={remainder === 0 ? '' : remainder.toString()}
                    onChange={(e) =>
                      onCrateChange?.({
                        kind: 'remainingKg',
                        index: i,
                        value: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="h-10 pr-10 text-left text-base"
                    placeholder={remainingKgLabel}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                    kg
                  </span>
                </div>
              </div>
              {overRemainder && (
                <p className="text-xs text-amber-600">{remainderWarning}</p>
              )}
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCrateChange?.({ kind: 'addClass' })}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          {h?.addQualityClass ?? 'Add quality class'}
        </Button>

        <div className="space-y-2 text-left">
          <p className="text-muted-foreground text-sm">{h?.waste ?? 'Waste'}</p>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={waste === 0 ? '' : waste.toString()}
              onChange={(e) =>
                onCrateChange?.({
                  kind: 'waste',
                  value: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="h-10 pr-10 text-left text-base"
              placeholder={h?.enterWasteAmount ?? 'Enter waste amount'}
            />
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
              kg
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground text-sm font-medium">
          {h?.totalYield ?? 'Total yield'}
        </span>
        <span className="text-lg font-bold text-teal-600">
          {total.toFixed(1)} kg
        </span>
      </div>
    </div>
  );
}

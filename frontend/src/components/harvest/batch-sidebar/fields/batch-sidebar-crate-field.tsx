'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import type { CrateYieldFieldProps } from '@/types/batch-sidebar.types';
import {
  crateClassKg,
  crateEntryTotalKg,
} from '@/lib/harvest-utils';

// One quality row: a crate-count input + a remainder input, with the derived
// per-class kg shown alongside.
interface ClassRow {
  cls: 'A' | 'B' | 'C';
  label: string;
  countField: 'crateCountA' | 'crateCountB' | 'crateCountC';
  remainderField: 'remainingKgA' | 'remainingKgB' | 'remainingKgC';
  count: number;
  remainder: number;
}

export function CrateYieldField({
  crateCountA,
  crateCountB,
  crateCountC,
  remainingKgA,
  remainingKgB,
  remainingKgC,
  waste,
  crateWeight,
  onCrateChange,
  isLoading = false,
}: CrateYieldFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const weight = crateWeight ?? 0;

  const rows: ReadonlyArray<ClassRow> = [
    {
      cls: 'A',
      label: h?.qualityA ?? 'Quality A',
      countField: 'crateCountA',
      remainderField: 'remainingKgA',
      count: crateCountA,
      remainder: remainingKgA,
    },
    {
      cls: 'B',
      label: h?.qualityB ?? 'Quality B',
      countField: 'crateCountB',
      remainderField: 'remainingKgB',
      count: crateCountB,
      remainder: remainingKgB,
    },
    {
      cls: 'C',
      label: h?.qualityC ?? 'Quality C',
      countField: 'crateCountC',
      remainderField: 'remainingKgC',
      count: crateCountC,
      remainder: remainingKgC,
    },
  ];

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

  const total = crateEntryTotalKg(
    { crateCountA, crateCountB, crateCountC, remainingKgA, remainingKgB, remainingKgC },
    crateWeight,
  );

  const crateUnit = h?.cratesUnit ?? 'crates';
  const remainingKgLabel = h?.remainingKg ?? 'Remaining (kg)';
  const remainderWarning = (
    h?.remainingKgExceedsCrate ??
    'At/above one full crate ({weight} kg) — count another crate?'
  ).replace('{weight}', String(weight));

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
        {rows.map((row) => {
          const kg = crateClassKg(row.count, row.remainder, crateWeight);
          const overRemainder = weight > 0 && row.remainder >= weight;
          return (
            <div key={row.cls} className="space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">{row.label}</p>
                <span className="text-sm font-medium text-teal-600">
                  {kg.toFixed(1)} kg
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={row.count === 0 ? '' : row.count.toString()}
                    onChange={(e) =>
                      onCrateChange?.(
                        row.countField,
                        Math.max(0, Math.trunc(parseFloat(e.target.value) || 0)),
                      )
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
                    value={row.remainder === 0 ? '' : row.remainder.toString()}
                    onChange={(e) =>
                      onCrateChange?.(
                        row.remainderField,
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
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

        <div className="space-y-2 text-left">
          <p className="text-muted-foreground text-sm">{h?.waste ?? 'Waste'}</p>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={waste === 0 ? '' : waste.toString()}
              onChange={(e) =>
                onCrateChange?.('waste', Math.max(0, parseFloat(e.target.value) || 0))
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

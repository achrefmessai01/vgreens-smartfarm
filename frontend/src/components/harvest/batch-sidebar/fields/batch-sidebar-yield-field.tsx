'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { YieldDataFieldProps } from '@/types/batch-sidebar.types';
import { classLetter, isRowOutsideBatchRange } from '@/lib/harvest-utils';
import { FieldMessage } from '@/components/harvest/field-message';
import { WasteWarning } from './batch-sidebar-waste-warning';

export function YieldDataField({
  classKgs,
  waste,
  rowX,
  rowY,
  batchStartRow,
  batchEndRow,
  wasteConfirmed,
  onConfirmWasteChange,
  onChange,
  isLoading = false,
}: YieldDataFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  // Summed quality yield (kg) across all classes — compared against waste below.
  const qualityTotalKg = classKgs.reduce(
    (sum, v) => sum + (Number.isFinite(v) ? v : 0),
    0,
  );
  // When the batch defines a row range, flag (without blocking) any value
  // outside it. A null/unset range leaves the inputs unconstrained.
  const outOfRangeText = (
    h?.rowOutsideBatchRange ?? 'Outside the batch row range ({start}–{end})'
  )
    .replace('{start}', String(batchStartRow))
    .replace('{end}', String(batchEndRow));
  const [showRowCoordinates, setShowRowCoordinates] = React.useState(
    rowX > 0 || rowY > 0,
  );
  const classLabelTpl = h?.qualityClassLabel ?? 'Quality {class}';
  const canRemove = classKgs.length > 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
        <div className="bg-muted h-10 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          {h?.yieldData ?? 'Yield Data'}
        </p>
        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm select-none">
          <Checkbox
            checked={showRowCoordinates}
            onCheckedChange={(checked) =>
              setShowRowCoordinates(checked === true)
            }
          />
          <span>{h?.showRowCoordinates ?? 'Show row coordinates'}</span>
        </label>
      </div>

      <div className="space-y-3">
        {classKgs.map((value, i) => (
          <div key={i} className="space-y-2 text-left">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-sm">
                {classLabelTpl.replace('{class}', classLetter(i))}
              </p>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => onChange?.({ kind: 'removeClass', index: i })}
                  aria-label={h?.removeQualityClass ?? 'Remove class'}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="relative">
              <DecimalInput
                value={value}
                onChange={(v) =>
                  onChange?.({ kind: 'classKg', index: i, value: v })
                }
                className="h-10 pr-12 text-left text-base"
                placeholder={h?.enterQualityAYield ?? 'Enter yield'}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                kg
              </span>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange?.({ kind: 'addClass' })}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          {h?.addQualityClass ?? 'Add quality class'}
        </Button>

        <div className="space-y-2 text-left">
          <p className="text-muted-foreground text-sm">{h?.waste ?? 'Waste'}</p>
          <div className="relative">
            <DecimalInput
              value={waste}
              onChange={(v) => onChange?.({ kind: 'waste', value: v })}
              className="h-10 pr-12 text-left text-base"
              placeholder={h?.enterWasteAmount ?? 'Enter waste amount'}
            />
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
              kg
            </span>
          </div>
          <WasteWarning
            waste={waste}
            qualityTotalKg={qualityTotalKg}
            confirmed={wasteConfirmed}
            onConfirmChange={onConfirmWasteChange}
          />
        </div>

        {showRowCoordinates && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <p className="text-muted-foreground text-sm">
                {h?.rowX ?? 'Row X'}
              </p>
              <div className="relative">
                <DecimalInput
                  value={rowX}
                  onChange={(v) => onChange?.({ kind: 'rowX', value: v })}
                  className="h-10 pr-12 text-left text-base"
                  placeholder={h?.enterRowX ?? 'Start row'}
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                  {h?.rowsUnit ?? 'rows'}
                </span>
              </div>
              {isRowOutsideBatchRange(rowX, batchStartRow, batchEndRow) && (
                <FieldMessage variant="warning" size="xs">
                  {outOfRangeText}
                </FieldMessage>
              )}
            </div>
            <div className="space-y-2 text-left">
              <p className="text-muted-foreground text-sm">
                {h?.rowY ?? 'Row Y'}
              </p>
              <div className="relative">
                <DecimalInput
                  value={rowY}
                  onChange={(v) => onChange?.({ kind: 'rowY', value: v })}
                  className="h-10 pr-12 text-left text-base"
                  placeholder={h?.enterRowY ?? 'End row'}
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                  {h?.rowsUnit ?? 'rows'}
                </span>
              </div>
              {isRowOutsideBatchRange(rowY, batchStartRow, batchEndRow) && (
                <FieldMessage variant="warning" size="xs">
                  {outOfRangeText}
                </FieldMessage>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

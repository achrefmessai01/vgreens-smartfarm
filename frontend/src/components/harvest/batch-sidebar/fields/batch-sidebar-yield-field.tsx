'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { YieldDataFieldProps } from '@/types/batch-sidebar.types';

export function YieldDataField({
  marketable,
  waste,
  classB,
  classC,
  rowX,
  rowY,
  onYieldChange,
  isLoading = false,
}: YieldDataFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  // Auto-reveal the row coordinates when the entry already carries values, so
  // existing coordinates stay visible when viewing/editing a harvest.
  const [showRowCoordinates, setShowRowCoordinates] = React.useState(
    rowX > 0 || rowY > 0,
  );

  // The four crop-grade inputs, rendered in order. Quality A maps to the
  // `marketable` (classA) field; Quality D is the existing `waste` field.
  const yieldFields: ReadonlyArray<{
    field: 'marketable' | 'classB' | 'classC' | 'waste';
    label: string;
    placeholder: string;
    value: number;
  }> = [
    {
      field: 'marketable',
      label: h?.qualityA ?? 'Quality A',
      placeholder: h?.enterQualityAYield ?? 'Enter Quality A yield',
      value: marketable,
    },
    {
      field: 'classB',
      label: h?.qualityB ?? 'Quality B',
      placeholder: h?.enterQualityBYield ?? 'Enter Quality B yield',
      value: classB,
    },
    {
      field: 'classC',
      label: h?.qualityC ?? 'Quality C',
      placeholder: h?.enterQualityCYield ?? 'Enter Quality C yield',
      value: classC,
    },
    {
      field: 'waste',
      label: h?.waste ?? 'Waste',
      placeholder: h?.enterWasteAmount ?? 'Enter waste amount',
      value: waste,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted h-10 animate-pulse rounded" />
          <div className="bg-muted h-10 animate-pulse rounded" />
          <div className="bg-muted h-10 animate-pulse rounded" />
          <div className="bg-muted h-10 animate-pulse rounded" />
          {showRowCoordinates && (
            <>
              <div className="bg-muted h-10 animate-pulse rounded" />
              <div className="bg-muted h-10 animate-pulse rounded" />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
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
        <div className="grid grid-cols-2 gap-4">
          {yieldFields.map(({ field, label, placeholder, value }) => (
            <div key={field} className="space-y-2 text-left">
              <p className="text-muted-foreground text-sm">{label}</p>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={value === 0 ? '' : value.toString()}
                  onChange={(e) =>
                    onYieldChange?.(field, parseFloat(e.target.value) || 0)
                  }
                  className="h-10 pr-12 text-left text-base"
                  placeholder={placeholder}
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                  kg
                </span>
              </div>
            </div>
          ))}
          {showRowCoordinates && (
            <>
              <div className="space-y-2 text-left">
                <p className="text-muted-foreground text-sm">
                  {h?.rowX ?? 'Row X'}
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={rowX === 0 ? '' : rowX.toString()}
                    onChange={(e) =>
                      onYieldChange?.(
                        'rowX',
                        Math.max(0, Number.parseFloat(e.target.value) || 0),
                      )
                    }
                    className="h-10 pr-12 text-left text-base"
                    placeholder={h?.enterRowX ?? 'Start row'}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    {h?.rowsUnit ?? 'rows'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <p className="text-muted-foreground text-sm">
                  {h?.rowY ?? 'Row Y'}
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={rowY === 0 ? '' : rowY.toString()}
                    onChange={(e) =>
                      onYieldChange?.(
                        'rowY',
                        Math.max(0, Number.parseFloat(e.target.value) || 0),
                      )
                    }
                    className="h-10 pr-12 text-left text-base"
                    placeholder={h?.enterRowY ?? 'End row'}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    {h?.rowsUnit ?? 'rows'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import type { YieldDataFieldProps } from '@/types/batch-sidebar.types';

export function YieldDataField({
  marketable,
  waste,
  classB,
  rowX,
  rowY,
  onYieldChange,
  isLoading = false,
}: YieldDataFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const classBMode = useHarvestClassBMode();
  const [showRowCoordinates, setShowRowCoordinates] = React.useState(false);
  const marketableRef = React.useRef<HTMLInputElement>(null);
  const secondaryRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextField: 'secondary' | 'brix1',
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField === 'secondary') {
        secondaryRef.current?.focus();
      } else if (nextField === 'brix1') {
        document.getElementById('brix-1')?.focus();
      }
    }
  };

  const primaryLabel = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.marketable ?? 'Marketable');
  const secondaryLabel = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste');
  const primaryPlaceholder = classBMode
    ? (h?.enterQuality1Yield ?? 'Enter Quality 1 yield')
    : (h?.enterMarketableYield ?? 'Enter marketable yield');
  const secondaryPlaceholder = classBMode
    ? (h?.enterQuality2Yield ?? 'Enter Quality 2 yield')
    : (h?.enterWasteAmount ?? 'Enter waste amount');

  const secondaryValue = classBMode ? classB : waste;
  const secondaryField: 'classB' | 'waste' = classBMode ? 'classB' : 'waste';
  const headlineValue = classBMode ? marketable + classB : marketable;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-medium">{h?.todaysHarvest ?? "Today's Harvest"}</h3>
        <span className="text-2xl font-bold text-teal-600">
          {headlineValue.toFixed(1)} kg
        </span>
      </div>
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
            <span>Show row coordinates</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-left">
            <p className="text-muted-foreground text-sm">{primaryLabel}</p>
            <div className="relative">
              <Input
                ref={marketableRef}
                type="number"
                min="0"
                step="0.1"
                value={marketable === 0 ? '' : marketable.toString()}
                onChange={(e) =>
                  onYieldChange?.('marketable', parseFloat(e.target.value) || 0)
                }
                onKeyDown={(e) => handleKeyDown(e, 'secondary')}
                className="h-10 pr-12 text-left text-base"
                placeholder={primaryPlaceholder}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                kg
              </span>
            </div>
          </div>
          <div className="space-y-2 text-left">
            <p className="text-muted-foreground text-sm">{secondaryLabel}</p>
            <div className="relative">
              <Input
                ref={secondaryRef}
                type="number"
                min="0"
                step="0.1"
                value={secondaryValue === 0 ? '' : secondaryValue.toString()}
                onChange={(e) =>
                  onYieldChange?.(
                    secondaryField,
                    parseFloat(e.target.value) || 0,
                  )
                }
                onKeyDown={(e) => handleKeyDown(e, 'brix1')}
                className="h-10 pr-12 text-left text-base"
                placeholder={secondaryPlaceholder}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                kg
              </span>
            </div>
          </div>
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
                    step="1"
                    value={rowX === 0 ? '' : rowX.toString()}
                    onChange={(e) =>
                      onYieldChange?.(
                        'rowX',
                        Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="h-10 pr-12 text-left text-base"
                    placeholder={h?.enterRowX ?? 'Start row'}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    rows
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
                    step="1"
                    value={rowY === 0 ? '' : rowY.toString()}
                    onChange={(e) =>
                      onYieldChange?.(
                        'rowY',
                        Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="h-10 pr-12 text-left text-base"
                    placeholder={h?.enterRowY ?? 'End row'}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    rows
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

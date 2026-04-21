'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import type { YieldDataFieldProps } from '@/types/batch-sidebar.types';

export function YieldDataField({
  marketable,
  waste,
  numberOfRowsHarvested,
  onYieldChange,
  isLoading = false,
}: YieldDataFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const marketableRef = React.useRef<HTMLInputElement>(null);
  const wasteRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextField: 'waste' | 'brix1',
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField === 'waste') {
        wasteRef.current?.focus();
      } else if (nextField === 'brix1') {
        document.getElementById('brix-1')?.focus();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-muted h-10 animate-pulse rounded" />
          <div className="bg-muted h-10 animate-pulse rounded" />
          <div className="bg-muted h-10 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-medium">{h?.todaysHarvest ?? "Today's Harvest"}</h3>
        <span className="text-2xl font-bold text-teal-600">
          {marketable.toFixed(1)} kg
        </span>
      </div>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          {h?.yieldData ?? 'Yield Data'}
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="col-span-2 space-y-2 text-left sm:col-span-1">
            <p className="text-muted-foreground text-sm">
              {h?.marketable ?? 'Marketable'}
            </p>
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
                onKeyDown={(e) => handleKeyDown(e, 'waste')}
                className="h-10 pr-12 text-left text-base"
                placeholder={
                  h?.enterMarketableYield ?? 'Enter marketable yield'
                }
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                kg
              </span>
            </div>
          </div>
          <div className="col-span-2 space-y-2 text-left sm:col-span-1">
            <p className="text-muted-foreground text-sm">
              {h?.waste ?? 'Waste'}
            </p>
            <div className="relative">
              <Input
                ref={wasteRef}
                type="number"
                min="0"
                step="0.1"
                value={waste === 0 ? '' : waste.toString()}
                onChange={(e) =>
                  onYieldChange?.('waste', parseFloat(e.target.value) || 0)
                }
                onKeyDown={(e) => handleKeyDown(e, 'brix1')}
                className="h-10 pr-12 text-left text-base"
                placeholder={h?.enterWasteAmount ?? 'Enter waste amount'}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                kg
              </span>
            </div>
          </div>
          <div className="col-span-2 space-y-2 text-left lg:col-span-1">
            <p className="text-muted-foreground text-sm">
              {h?.numberOfRowsHarvested ?? 'Number of Rows Harvested'}
            </p>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1"
                value={
                  numberOfRowsHarvested === 0
                    ? ''
                    : numberOfRowsHarvested.toString()
                }
                onChange={(e) =>
                  onYieldChange?.(
                    'numberOfRowsHarvested',
                    Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                  )
                }
                className="h-10 pr-12 text-left text-base"
                placeholder={h?.enterRowsHarvested ?? 'Rows harvested'}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                rows
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

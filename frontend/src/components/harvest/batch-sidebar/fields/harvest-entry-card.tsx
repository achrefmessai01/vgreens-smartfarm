'use client';

import * as React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import type { HarvestEntryData } from '@/types/batch-sidebar.types';
import { YieldDataField } from './batch-sidebar-yield-field';
import { BrixMeasurementsField } from './batch-sidebar-brix-field';
import { FruitWeightField } from './batch-sidebar-fruit-weight-field';

export interface HarvestEntryCardProps {
  entry: HarvestEntryData;
  index: number;
  canRemove: boolean;
  defaultOpen?: boolean;
  onYieldChange: (
    field: 'marketable' | 'waste' | 'classB' | 'rowX' | 'rowY',
    value: number,
  ) => void;
  onBrixChange: (readingIndex: number, value: number) => void;
  onAddBrixReading: () => void;
  onRemoveBrixReading: (readingIndex: number) => void;
  onSetShowBrix: (show: boolean) => void;
  onFruitCountChange: (value: number) => void;
  onSetShowFruitWeight: (show: boolean) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function HarvestEntryCard({
  entry,
  index,
  canRemove,
  defaultOpen = false,
  onYieldChange,
  onBrixChange,
  onAddBrixReading,
  onRemoveBrixReading,
  onSetShowBrix,
  onFruitCountChange,
  onSetShowFruitWeight,
  onRemove,
  isLoading = false,
}: HarvestEntryCardProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const classBMode = useHarvestClassBMode();
  const [open, setOpen] = React.useState(defaultOpen);

  const idPrefix = `entry-${index}-`;
  const headlineValue = classBMode
    ? entry.marketable + entry.classB
    : entry.marketable;
  const entryTitle = (h?.entryLabel ?? 'Entry {n}').replace(
    '{n}',
    String(index + 1),
  );

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
            aria-hidden="true"
          />
          <span className="font-medium">{entryTitle}</span>
          <span className="ml-auto text-lg font-bold text-teal-600">
            {headlineValue.toFixed(1)} kg
          </span>
        </button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-9 w-9 shrink-0"
          onClick={onRemove}
          disabled={isLoading || !canRemove}
          aria-label={h?.removeEntry ?? 'Remove entry'}
        >
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div className="space-y-4 border-t p-3">
          <YieldDataField
            marketable={entry.marketable}
            waste={entry.waste}
            classB={entry.classB}
            rowX={entry.rowX}
            rowY={entry.rowY}
            onYieldChange={onYieldChange}
            isLoading={isLoading}
          />
          <div className="border-t pt-4">
            <BrixMeasurementsField
              readings={entry.brixReadings}
              showBrix={entry.showBrix}
              onShowBrixChange={onSetShowBrix}
              onReadingChange={onBrixChange}
              onAddReading={onAddBrixReading}
              onRemoveReading={onRemoveBrixReading}
              idPrefix={idPrefix}
              isLoading={isLoading}
            />
          </div>
          <div className="border-t pt-4">
            <FruitWeightField
              fruitCount={entry.fruitCount}
              marketable={entry.marketable}
              classB={entry.classB}
              showFruitWeight={entry.showFruitWeight}
              onShowFruitWeightChange={onSetShowFruitWeight}
              onFruitCountChange={onFruitCountChange}
              idPrefix={idPrefix}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

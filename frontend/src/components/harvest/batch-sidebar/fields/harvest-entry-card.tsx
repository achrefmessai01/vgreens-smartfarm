'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '@/i18n';
import { InputMode } from '@/generated/graphql';
import type { HarvestQualityClass } from '@/generated/graphql';
import type {
  EntryChange,
  HarvestEntryData,
} from '@/types/batch-sidebar.types';
import { crateEntryTotalKg } from '@/lib/harvest-utils';
import { HarvestEntryForm } from './harvest-entry-form';

export interface HarvestEntryCardProps {
  entry: HarvestEntryData;
  index: number;
  // The parent batch's mode + crate weight; decide which layout the form
  // renders and how crate-mode totals are derived.
  inputMode: InputMode;
  crateWeight: number | null;
  // The parent batch's row range; forwarded to the yield field to limit and
  // validate the per-entry row coordinates.
  batchStartRow?: number | null;
  batchEndRow?: number | null;
  // Soft waste-vs-quality check: whether the user has acknowledged a waste value
  // exceeding the summed quality yield for this entry, and the setter to toggle it.
  wasteConfirmed: boolean;
  onConfirmWasteChange: (confirmed: boolean) => void;
  defaultOpen?: boolean;
  onChange: (change: EntryChange) => void;
  onBrixChange: (readingIndex: number, value: number) => void;
  onBrixClassChange: (readingIndex: number, value: HarvestQualityClass) => void;
  onAddBrixReading: () => void;
  onRemoveBrixReading: (readingIndex: number) => void;
  onSetShowBrix: (show: boolean) => void;
  onSampleWeightChange: (value: number) => void;
  onSampleFruitCountChange: (value: number) => void;
  onSetShowFruitWeight: (show: boolean) => void;
  isLoading?: boolean;
}

export function HarvestEntryCard({
  entry,
  index,
  inputMode,
  crateWeight,
  batchStartRow,
  batchEndRow,
  wasteConfirmed,
  onConfirmWasteChange,
  defaultOpen = false,
  onChange,
  onBrixChange,
  onBrixClassChange,
  onAddBrixReading,
  onRemoveBrixReading,
  onSetShowBrix,
  onSampleWeightChange,
  onSampleFruitCountChange,
  onSetShowFruitWeight,
  isLoading = false,
}: HarvestEntryCardProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const [open, setOpen] = React.useState(defaultOpen);

  // Headline is the entry's total sellable yield across all quality classes. In
  // crate mode it's derived from the crate counts + the batch crate weight.
  const headlineValue =
    inputMode === InputMode.Crate
      ? crateEntryTotalKg(entry.crateCounts, entry.remainingKgs, crateWeight)
      : entry.classKgs.reduce((s, v) => s + (v || 0), 0);
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
      </div>

      {open && (
        <div className="border-t p-3">
          <HarvestEntryForm
            entry={entry}
            index={index}
            inputMode={inputMode}
            crateWeight={crateWeight}
            batchStartRow={batchStartRow}
            batchEndRow={batchEndRow}
            wasteConfirmed={wasteConfirmed}
            onConfirmWasteChange={onConfirmWasteChange}
            onChange={onChange}
            onBrixChange={onBrixChange}
            onBrixClassChange={onBrixClassChange}
            onAddBrixReading={onAddBrixReading}
            onRemoveBrixReading={onRemoveBrixReading}
            onSetShowBrix={onSetShowBrix}
            onSampleWeightChange={onSampleWeightChange}
            onSampleFruitCountChange={onSampleFruitCountChange}
            onSetShowFruitWeight={onSetShowFruitWeight}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

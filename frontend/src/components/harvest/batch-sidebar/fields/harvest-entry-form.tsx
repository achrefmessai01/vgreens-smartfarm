'use client';

import * as React from 'react';
import { InputMode } from '@/generated/graphql';
import type { HarvestQualityClass } from '@/generated/graphql';
import type {
  EntryChange,
  HarvestEntryData,
} from '@/types/batch-sidebar.types';
import { YieldDataField } from './batch-sidebar-yield-field';
import { CrateYieldField } from './batch-sidebar-crate-field';
import { BrixMeasurementsField } from './batch-sidebar-brix-field';
import { FruitWeightField } from './batch-sidebar-fruit-weight-field';

export interface HarvestEntryFormProps {
  entry: HarvestEntryData;
  // Used only to namespace input ids so repeated entries don't collide.
  index: number;
  // Batch mode + crate weight decide which layout renders and how crate-mode
  // kg are derived.
  inputMode: InputMode;
  crateWeight: number | null;
  // When true the fruit-weight section uses the "Tross Weight" labels (tomato).
  isTomato?: boolean;
  // Batch row range, forwarded to the weight-mode yield field.
  batchStartRow?: number | null;
  batchEndRow?: number | null;
  // Soft waste-vs-quality check: whether the user has acknowledged a waste value
  // exceeding the summed quality yield for this entry, and the setter to toggle it.
  wasteConfirmed: boolean;
  onConfirmWasteChange: (confirmed: boolean) => void;
  // Unified per-entry field change (per-class cells, waste, row coords,
  // add/remove class) for both modes.
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

// Presentational entry form. Renders the weight or crate yield layout per the
// batch mode, with the shared Brix + Fruit-weight sections below. No Apollo /
// routing: the parent owns submit and persistence, so this can be mounted both
// in the sidebar and inline on a page.
export function HarvestEntryForm({
  entry,
  index,
  inputMode,
  crateWeight,
  isTomato,
  batchStartRow,
  batchEndRow,
  wasteConfirmed,
  onConfirmWasteChange,
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
}: HarvestEntryFormProps) {
  const idPrefix = `entry-${index}-`;
  const isCrate = inputMode === InputMode.Crate;

  return (
    <div className="space-y-4">
      {isCrate ? (
        <CrateYieldField
          crateCounts={entry.crateCounts}
          remainingKgs={entry.remainingKgs}
          waste={entry.waste}
          crateWeight={crateWeight}
          wasteConfirmed={wasteConfirmed}
          onConfirmWasteChange={onConfirmWasteChange}
          onChange={onChange}
          isLoading={isLoading}
        />
      ) : (
        <YieldDataField
          classKgs={entry.classKgs}
          waste={entry.waste}
          rowX={entry.rowX}
          rowY={entry.rowY}
          batchStartRow={batchStartRow}
          batchEndRow={batchEndRow}
          wasteConfirmed={wasteConfirmed}
          onConfirmWasteChange={onConfirmWasteChange}
          onChange={onChange}
          isLoading={isLoading}
        />
      )}
      <div className="border-t pt-4">
        <BrixMeasurementsField
          readings={entry.brixReadings}
          classes={entry.brixClasses}
          showBrix={entry.showBrix}
          onShowBrixChange={onSetShowBrix}
          onReadingChange={onBrixChange}
          onClassChange={onBrixClassChange}
          onAddReading={onAddBrixReading}
          onRemoveReading={onRemoveBrixReading}
          idPrefix={idPrefix}
          isLoading={isLoading}
        />
      </div>
      <div className="border-t pt-4">
        <FruitWeightField
          sampleWeight={entry.sampleWeight}
          sampleFruitCount={entry.sampleFruitCount}
          showFruitWeight={entry.showFruitWeight}
          onShowFruitWeightChange={onSetShowFruitWeight}
          onSampleWeightChange={onSampleWeightChange}
          onSampleFruitCountChange={onSampleFruitCountChange}
          isTomato={isTomato}
          idPrefix={idPrefix}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

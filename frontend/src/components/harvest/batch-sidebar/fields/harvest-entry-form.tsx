'use client';

import * as React from 'react';
import { InputMode } from '@/generated/graphql';
import type { HarvestQualityClass } from '@/generated/graphql';
import type { HarvestEntryData } from '@/types/batch-sidebar.types';
import { crateClassKg } from '@/lib/harvest-utils';
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
  // Batch row range, forwarded to the weight-mode yield field.
  batchStartRow?: number | null;
  batchEndRow?: number | null;
  onYieldChange: (
    field: 'marketable' | 'waste' | 'classB' | 'classC' | 'rowX' | 'rowY',
    value: number,
  ) => void;
  onCrateChange: (
    field:
      | 'crateCountA'
      | 'crateCountB'
      | 'crateCountC'
      | 'remainingKgA'
      | 'remainingKgB'
      | 'remainingKgC'
      | 'waste',
    value: number,
  ) => void;
  onBrixChange: (readingIndex: number, value: number) => void;
  onBrixClassChange: (readingIndex: number, value: HarvestQualityClass) => void;
  onAddBrixReading: () => void;
  onRemoveBrixReading: (readingIndex: number) => void;
  onSetShowBrix: (show: boolean) => void;
  onFruitCountChange: (value: number) => void;
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
  batchStartRow,
  batchEndRow,
  onYieldChange,
  onCrateChange,
  onBrixChange,
  onBrixClassChange,
  onAddBrixReading,
  onRemoveBrixReading,
  onSetShowBrix,
  onFruitCountChange,
  onSetShowFruitWeight,
  isLoading = false,
}: HarvestEntryFormProps) {
  const idPrefix = `entry-${index}-`;
  const isCrate = inputMode === InputMode.Crate;

  // The sellable per-class kg the Fruit-weight section averages over. In crate
  // mode these are derived from the crate inputs; in weight mode they're the
  // entered class kg.
  const classAKg = isCrate
    ? crateClassKg(entry.crateCountA, entry.remainingKgA, crateWeight)
    : entry.marketable;
  const classBKg = isCrate
    ? crateClassKg(entry.crateCountB, entry.remainingKgB, crateWeight)
    : entry.classB;
  const classCKg = isCrate
    ? crateClassKg(entry.crateCountC, entry.remainingKgC, crateWeight)
    : entry.classC;

  return (
    <div className="space-y-4">
      {isCrate ? (
        <CrateYieldField
          crateCountA={entry.crateCountA}
          crateCountB={entry.crateCountB}
          crateCountC={entry.crateCountC}
          remainingKgA={entry.remainingKgA}
          remainingKgB={entry.remainingKgB}
          remainingKgC={entry.remainingKgC}
          waste={entry.waste}
          crateWeight={crateWeight}
          onCrateChange={onCrateChange}
          isLoading={isLoading}
        />
      ) : (
        <YieldDataField
          marketable={entry.marketable}
          waste={entry.waste}
          classB={entry.classB}
          classC={entry.classC}
          rowX={entry.rowX}
          rowY={entry.rowY}
          batchStartRow={batchStartRow}
          batchEndRow={batchEndRow}
          onYieldChange={onYieldChange}
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
          fruitCount={entry.fruitCount}
          marketable={classAKg}
          classB={classBKg}
          classC={classCKg}
          showFruitWeight={entry.showFruitWeight}
          onShowFruitWeightChange={onSetShowFruitWeight}
          onFruitCountChange={onFruitCountChange}
          idPrefix={idPrefix}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

import { HarvestQualityClass } from '@/generated/graphql';
import type { BatchStatus, InputMode } from '@/generated/graphql';

// One repeatable "Today Harvest" sub-entry: its own yield, row coordinates,
// brix readings and fruit-weight measurement. `showBrix`/`showFruitWeight`
// control whether the optional sections are expanded for this entry.
export interface HarvestEntryData {
  marketable: number;
  waste: number;
  classB: number;
  classC: number;
  rowX: number;
  rowY: number;
  // Crate-mode inputs (ignored in weight mode): positional per-quality arrays
  // (index 0=A, 1=B, 2=C) of crate counts and remaining-kg tails. kg/total are
  // derived from the batch crateWeight. Always length 3 in form state.
  crateCounts: number[];
  remainingKgs: number[];
  brixReadings: number[];
  // Quality grade per Brix reading, index-aligned with brixReadings.
  brixClasses: HarvestQualityClass[];
  showBrix: boolean;
  fruitCount: number;
  showFruitWeight: boolean;
}

// True when the entry carries any harvest data — used to auto-expand its card
// when viewing/editing an existing harvest.
export function entryHasData(entry: HarvestEntryData): boolean {
  return (
    entry.marketable > 0 ||
    entry.waste > 0 ||
    entry.classB > 0 ||
    entry.classC > 0 ||
    entry.rowX > 0 ||
    entry.rowY > 0 ||
    entry.crateCounts.some((v) => v > 0) ||
    entry.remainingKgs.some((v) => v > 0) ||
    entry.fruitCount > 0 ||
    entry.brixReadings.some((v) => v > 0)
  );
}

export function createEmptyEntry(): HarvestEntryData {
  return {
    marketable: 0,
    waste: 0,
    classB: 0,
    classC: 0,
    rowX: 0,
    rowY: 0,
    crateCounts: [0, 0, 0],
    remainingKgs: [0, 0, 0],
    brixReadings: [0],
    brixClasses: [HarvestQualityClass.A],
    showBrix: false,
    fruitCount: 0,
    showFruitWeight: false,
  };
}

export interface BatchDetailsData {
  id: string;
  name: string;
  species: string;
  variety: string;
  status: BatchStatus;
  greenhouse: {
    id: string;
    name: string;
  };
  daysAfterPlanting: number;
  area: number;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
  // Inclusive row range the batch occupies. null when not yet backfilled, in
  // which case harvest row inputs stay unconstrained (fallback behavior).
  startRow: number | null;
  endRow: number | null;
  totalPlants: number;
  lostPlants: number;
  // Replicate samples configured on the batch; drives how many entry cards a
  // fresh harvest starts with. Always at least 1.
  replicates: number;
  // Yield input mode (fixed at creation) and the per-batch crate weight (kg).
  // crateWeight is null in weight mode. Drive which form layout renders and how
  // crate-mode totals are derived.
  inputMode: InputMode;
  crateWeight: number | null;
  plantingDate: string;
  // Repeatable sub-entries; always at least one. Photos and the harvest date
  // live at the record level, not per entry.
  entries: HarvestEntryData[];
  photos: string[];
}

export interface BatchHeaderFieldProps {
  name: string;
  species: string;
  variety: string;
  status: BatchStatus;
  isLoading?: boolean;
}

export interface BatchStatsFieldProps {
  daysAfterPlanting: number;
  area: number;
  isLoading?: boolean;
}

export interface YieldDataFieldProps {
  marketable: number;
  waste: number;
  classB: number;
  classC: number;
  rowX: number;
  rowY: number;
  // The batch's row range (inclusive). null bounds leave the row inputs
  // unconstrained; when set, inputs are limited and out-of-range values warn.
  batchStartRow?: number | null;
  batchEndRow?: number | null;
  onYieldChange?: (
    field: 'marketable' | 'waste' | 'classB' | 'classC' | 'rowX' | 'rowY',
    value: number,
  ) => void;
  isLoading?: boolean;
}

// How a crate-mode change is addressed: a per-quality array cell (by class
// index), the shared scalar waste field, or adding/removing a whole quality
// class (classes are dynamic and unbounded).
export type CrateChange =
  | { kind: 'crateCount'; index: number; value: number }
  | { kind: 'remainingKg'; index: number; value: number }
  | { kind: 'waste'; value: number }
  | { kind: 'addClass' }
  | { kind: 'removeClass'; index: number };

// Crate-mode yield inputs: positional per-quality arrays (index 0=A,1=B,2=C) of
// crate counts + remainders, plus the shared waste field. crateWeight (kg per
// crate) drives the derived per-class kg and the entry total. Presentational —
// the parent owns state.
export interface CrateYieldFieldProps {
  crateCounts: number[];
  remainingKgs: number[];
  waste: number;
  // Per-batch crate weight (kg). Null/0 means it hasn't been set; the field
  // still renders but derived kg show as 0.
  crateWeight: number | null;
  onCrateChange?: (change: CrateChange) => void;
  isLoading?: boolean;
}

export interface BrixMeasurementsFieldProps {
  readings: number[];
  // Quality grade per reading, index-aligned with `readings`.
  classes: HarvestQualityClass[];
  showBrix: boolean;
  onShowBrixChange: (show: boolean) => void;
  onReadingChange?: (index: number, value: number) => void;
  onClassChange?: (index: number, value: HarvestQualityClass) => void;
  onAddReading?: () => void;
  onRemoveReading?: (index: number) => void;
  // Namespaces input element ids so repeated entries don't collide.
  idPrefix?: string;
  isLoading?: boolean;
}

export interface FruitWeightFieldProps {
  fruitCount: number;
  // Total sellable yield (kg) the average fruit weight is derived from. The
  // parent computes it per mode (weight: A+B+C; crate: sum of all classes).
  sellableWeight: number;
  showFruitWeight: boolean;
  onShowFruitWeightChange: (show: boolean) => void;
  onFruitCountChange?: (value: number) => void;
  // Namespaces input element ids so repeated entries don't collide.
  idPrefix?: string;
  isLoading?: boolean;
}

export interface PhotosFieldProps {
  photos: string[];
  onUpload?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  isLoading?: boolean;
}

import { HarvestQualityClass } from '@/generated/graphql';
import type { BatchStatus, InputMode } from '@/generated/graphql';

// One repeatable "Today Harvest" sub-entry: its own yield, row coordinates,
// brix readings and fruit-weight measurement. `showBrix`/`showFruitWeight`
// control whether the optional sections are expanded for this entry.
export interface HarvestEntryData {
  // Client-local identity for list keys and drag-and-drop reordering. Never
  // sent to the API — the save maps entries to input objects positionally.
  uid: string;
  // Per-quality inputs, positional and dynamic (index 0=A, 1=B, 2=C, ...). Both
  // modes start with one class (A) and the form can add/remove classes. Weight
  // mode uses classKgs (kg per class); crate mode uses crateCounts + remainingKgs
  // (kg derived from the batch crateWeight). All kept the same length.
  classKgs: number[];
  crateCounts: number[];
  remainingKgs: number[];
  waste: number;
  // Parallel arrays of harvested row segments: rowX[i] pairs with rowY[i] to
  // span segment i (start -> end); the space between consecutive segments is a
  // gap. Kept equal-length. Empty means no rows recorded (optional section).
  rowX: number[];
  rowY: number[];
  brixReadings: number[];
  // Quality grade per Brix reading, index-aligned with brixReadings.
  brixClasses: HarvestQualityClass[];
  showBrix: boolean;
  // Sample-based fruit weight: the weighed sample's mass in grams and the number
  // of fruits in that sample. avgFruitWeight (g/fruit) is derived from the two.
  sampleWeight: number;
  sampleFruitCount: number;
  showFruitWeight: boolean;
}

// How an entry field change is addressed. Per-class edits target an array cell
// by class index; addClass/removeClass grow/shrink the class list (both modes'
// arrays stay in sync); the rest are shared scalars.
export type EntryChange =
  | { kind: 'classKg'; index: number; value: number }
  | { kind: 'crateCount'; index: number; value: number }
  | { kind: 'remainingKg'; index: number; value: number }
  | { kind: 'waste'; value: number }
  | { kind: 'rowX'; index: number; value: number }
  | { kind: 'rowY'; index: number; value: number }
  | { kind: 'addRowPair' }
  | { kind: 'removeRowPair'; index: number }
  | { kind: 'addClass' }
  | { kind: 'removeClass'; index: number };

// True when the entry carries any harvest data — used to auto-expand its card
// when viewing/editing an existing harvest.
export function entryHasData(entry: HarvestEntryData): boolean {
  return (
    entry.classKgs.some((v) => v > 0) ||
    entry.waste > 0 ||
    entry.rowX.some((v) => v > 0) ||
    entry.rowY.some((v) => v > 0) ||
    entry.crateCounts.some((v) => v > 0) ||
    entry.remainingKgs.some((v) => v > 0) ||
    entry.sampleWeight > 0 ||
    entry.sampleFruitCount > 0 ||
    entry.brixReadings.some((v) => v > 0)
  );
}

// Session-unique id for a form entry (see HarvestEntryData.uid).
let entryUidCounter = 0;
export function newEntryUid(): string {
  return `entry-${++entryUidCounter}`;
}

export function createEmptyEntry(): HarvestEntryData {
  // Start with a single quality class (A); more can be added in the form.
  return {
    uid: newEntryUid(),
    classKgs: [0],
    crateCounts: [0],
    remainingKgs: [0],
    waste: 0,
    // No row segments by default — the row-coordinates section is optional and
    // seeds its first pair only when opened.
    rowX: [],
    rowY: [],
    brixReadings: [0],
    brixClasses: [HarvestQualityClass.A],
    showBrix: false,
    sampleWeight: 0,
    sampleFruitCount: 0,
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
  // Yield input mode of THIS harvest (per-harvest — sibling harvests in the
  // same batch may differ). Drives which form layout renders. Seeded from the
  // stored harvest when editing, or from the batch's latest harvest (falling
  // back to weight) when creating.
  inputMode: InputMode;
  // The crate selected for this harvest (crate mode only). crateId is the chosen
  // crate's id (null until picked / in weight mode); crateWeight mirrors that
  // crate's weight (kg) so the existing kg derivation reads it unchanged. In
  // weight mode both are null. Selecting a crate sets both together.
  crateId: string | null;
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

// Weight-mode yield inputs: positional per-quality kg (index 0=A, 1=B, ...),
// dynamic count with add/remove, plus the shared waste field and optional row
// coordinates. Presentational — the parent owns state.
export interface YieldDataFieldProps {
  classKgs: number[];
  waste: number;
  // Parallel arrays of (start, end) row segments, aligned by index.
  rowX: number[];
  rowY: number[];
  // The batch's row range (inclusive). null bounds leave the row inputs
  // unconstrained; when set, inputs are limited and out-of-range values warn.
  batchStartRow?: number | null;
  batchEndRow?: number | null;
  // Soft waste-vs-quality check: whether the user has acknowledged a waste value
  // that exceeds the summed quality yield, and the setter to toggle it.
  wasteConfirmed: boolean;
  onConfirmWasteChange: (confirmed: boolean) => void;
  onChange?: (change: EntryChange) => void;
  isLoading?: boolean;
}

// Crate-mode yield inputs: positional per-quality arrays (index 0=A, 1=B, ...)
// of crate counts + remainders, dynamic count with add/remove, plus the shared
// waste field. crateWeight (kg per crate) drives the derived per-class kg and
// the entry total. Presentational — the parent owns state.
export interface CrateYieldFieldProps {
  crateCounts: number[];
  remainingKgs: number[];
  waste: number;
  // Per-batch crate weight (kg). Null/0 means it hasn't been set; the field
  // still renders but derived kg show as 0.
  crateWeight: number | null;
  // Soft waste-vs-quality check: whether the user has acknowledged a waste value
  // that exceeds the summed quality yield, and the setter to toggle it.
  wasteConfirmed: boolean;
  onConfirmWasteChange: (confirmed: boolean) => void;
  onChange?: (change: EntryChange) => void;
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
  // The weighed sample: its mass in grams and the count of fruits in it.
  // avgFruitWeight (g/fruit) = sampleWeight / sampleFruitCount.
  sampleWeight: number;
  sampleFruitCount: number;
  showFruitWeight: boolean;
  onShowFruitWeightChange: (show: boolean) => void;
  onSampleWeightChange?: (value: number) => void;
  onSampleFruitCountChange?: (value: number) => void;
  // When the harvested crop is a tomato, the labels read "Tross Weight" instead
  // of "Fruit Weight" (the truss is weighed rather than individual fruit).
  isTomato?: boolean;
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

import type { HarvestStatus } from '@/generated/graphql';

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
  brixReadings: number[];
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
    brixReadings: [0],
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
  status: HarvestStatus;
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
  totalPlants: number;
  lostPlants: number;
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
  status: HarvestStatus;
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
  onYieldChange?: (
    field: 'marketable' | 'waste' | 'classB' | 'classC' | 'rowX' | 'rowY',
    value: number,
  ) => void;
  isLoading?: boolean;
}

export interface BrixMeasurementsFieldProps {
  readings: number[];
  showBrix: boolean;
  onShowBrixChange: (show: boolean) => void;
  onReadingChange?: (index: number, value: number) => void;
  onAddReading?: () => void;
  onRemoveReading?: (index: number) => void;
  // Namespaces input element ids so repeated entries don't collide.
  idPrefix?: string;
  isLoading?: boolean;
}

export interface FruitWeightFieldProps {
  fruitCount: number;
  marketable: number;
  classB: number;
  classC: number;
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

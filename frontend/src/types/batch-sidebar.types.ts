import type { HarvestStatus } from '@/generated/graphql';

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
  todaysHarvest: {
    marketable: number;
    waste: number;
    classB: number;
    rowX: number;
    rowY: number;
  };
  brixReadings: number[];
  fruitCount: number;
  totalFruitWeight: number;
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
  rowX: number;
  rowY: number;
  harvestDate: string;
  maxDate: string;
  onHarvestDateChange: (value: string) => void;
  onYieldChange?: (
    field: 'marketable' | 'waste' | 'classB' | 'rowX' | 'rowY',
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
  isLoading?: boolean;
}

export interface FruitWeightFieldProps {
  fruitCount: number;
  marketable: number;
  classB: number;
  showFruitWeight: boolean;
  onShowFruitWeightChange: (show: boolean) => void;
  onFruitCountChange?: (value: number) => void;
  isLoading?: boolean;
}

export interface PhotosFieldProps {
  photos: string[];
  onUpload?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  isLoading?: boolean;
}

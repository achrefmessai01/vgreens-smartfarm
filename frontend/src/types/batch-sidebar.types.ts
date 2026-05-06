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
  plantingDate: string;
  todaysHarvest: {
    marketable: number;
    waste: number;
    rowX: number;
    rowY: number;
  };
  brixReadings: number[];
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
  rowX: number;
  rowY: number;
  onYieldChange?: (
    field: 'marketable' | 'waste' | 'rowX' | 'rowY',
    value: number,
  ) => void;
  isLoading?: boolean;
}

export interface BrixMeasurementsFieldProps {
  readings: number[];
  onReadingChange?: (index: number, value: number) => void;
  onAddReading?: () => void;
  onRemoveReading?: (index: number) => void;
  isLoading?: boolean;
}

export interface PhotosFieldProps {
  photos: string[];
  onUpload?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  isLoading?: boolean;
}

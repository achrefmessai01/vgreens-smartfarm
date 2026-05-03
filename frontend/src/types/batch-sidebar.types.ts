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
  brixMeasurements: {
    brix1: number;
    brix2: number;
    brix3: number;
    brix4: number;
    brix5: number;
    brix6: number;
    brix7: number;
    brix8: number;
    brix9: number;
    brix10: number;
  };
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
  measurements: {
    brix1: number;
    brix2: number;
    brix3: number;
    brix4: number;
    brix5: number;
    brix6: number;
    brix7: number;
    brix8: number;
    brix9: number;
    brix10: number;
  };
  onMeasurementChange?: (
    field: keyof BrixMeasurementsFieldProps['measurements'],
    value: number,
  ) => void;
  isLoading?: boolean;
}

export interface PhotosFieldProps {
  photos: string[];
  onUpload?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  isLoading?: boolean;
}

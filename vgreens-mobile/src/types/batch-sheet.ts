import type { HarvestStatus } from '@/generated/graphql';

export type BrixField =
  | 'brix1'
  | 'brix2'
  | 'brix3'
  | 'brix4'
  | 'brix5'
  | 'brix6'
  | 'brix7'
  | 'brix8'
  | 'brix9'
  | 'brix10';

export type BrixMeasurements = Record<BrixField, number>;

export type YieldField = 'marketable' | 'waste' | 'rowX' | 'rowY';

export interface BatchDetailsData {
  id: string;
  name: string;
  species: string;
  variety: string;
  status: HarvestStatus;
  greenhouse: { id: string; name: string };
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
  brixMeasurements: BrixMeasurements;
  photos: string[];
}

export type BatchSheetMode = 'create' | 'edit';

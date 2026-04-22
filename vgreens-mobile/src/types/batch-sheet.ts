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

export interface BatchDetailsData {
  id: string;
  name: string;
  species: string;
  variety: string;
  status: HarvestStatus;
  greenhouse: { id: string; name: string };
  daysAfterPlanting: number;
  area: number;
  plantingDate: string;
  todaysHarvest: { marketable: number; waste: number };
  brixMeasurements: BrixMeasurements;
  photos: string[];
}

export type BatchSheetMode = 'create' | 'edit';

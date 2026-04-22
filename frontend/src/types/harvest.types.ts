import { HarvestStatus } from '@/generated/graphql';

export interface HarvestRecord {
  id: string;
  date: string;
  batch: string;
  classA: number;
  waste: number;
  avgBrix: number;
  photos: number;
  createdAt: string;
  updatedAt: string;
}

export interface HarvestSummary {
  totalHarvests: number;
  variety: string;
  totalClassA: number;
  totalWaste: number;
  avgBrix: number;
}

export interface HarvestLike {
  id: string;
  batch: string;
  species: string;
  variety: string;
  status: HarvestStatus;
  greenhouse?: string | null;
  plantingDate: string;
  cultivationArea: number;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
  classA: number;
  waste: number;
  rowX: number;
  rowY: number;
  avgBrix: number;
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
  photoUrls?: string[] | null;
}

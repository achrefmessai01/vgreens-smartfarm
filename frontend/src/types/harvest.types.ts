import { HarvestStatus } from '@/generated/graphql';

export interface HarvestRecord {
  id: string;
  date: string;
  batch: string;
  classA: number;
  classB: number;
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
  totalClassB: number;
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
  totalPlants: number;
  lostPlants: number;
  classA: number;
  classB: number;
  waste: number;
  rowX: number;
  rowY: number;
  avgBrix: number;
  brixReadings: number[];
  photoUrls?: string[] | null;
}

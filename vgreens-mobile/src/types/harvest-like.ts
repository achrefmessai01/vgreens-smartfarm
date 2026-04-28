import type { HarvestStatus } from '@/generated/graphql';

export interface HarvestLike {
  id: string;
  batch: string;
  species: string;
  variety: string;
  greenhouse?: string | null;
  plantingDate: string;
  cultivationArea: number;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
  status?: HarvestStatus | null;
  classA: number;
  waste: number;
  avgBrix: number;
  rowX: number;
  rowY: number;
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
  photos: number;
  photoUrls?: string[] | null;
  parentBatchId?: string | null;
  createdAt: string;
  date: string;
  createdBy?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

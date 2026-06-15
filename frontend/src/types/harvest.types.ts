import { BatchStatus, type HarvestQualityClass } from '@/generated/graphql';

export interface HarvestRecord {
  id: string;
  date: string;
  batch: string;
  classA: number;
  classB: number;
  classC: number;
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
  totalClassC: number;
  totalWaste: number;
  avgBrix: number;
}

// A single brix measurement + the grade it belongs to (the normalized
// {class,value} shape that replaced the old parallel arrays).
export interface BrixReadingLike {
  class: HarvestQualityClass;
  value: number;
}

// One measured position within a harvest event. Mirrors the GraphQL
// HarvestEntry; avgFruitWeight / avgBrix are derived by the backend.
export interface HarvestEntryLike {
  id?: string;
  rowX: number;
  rowY: number;
  classA: number;
  classB: number;
  classC: number;
  waste: number;
  fruitCount: number;
  totalFruitWeight: number;
  avgFruitWeight: number;
  avgBrix: number;
  brixReadings: BrixReadingLike[];
}

// Service-computed totals for a harvest (the omitted-view replacement).
export interface HarvestTotalsLike {
  classA: number;
  classB: number;
  classC: number;
  waste: number;
  fruitCount: number;
  totalFruitWeight: number;
  avgFruitWeight?: number | null;
  avgBrix?: number | null;
  yieldPerPlant?: number | null;
  yieldPerMeter?: number | null;
}

// Planting-level data, now its own table. Structural subset of the generated
// Batch type so query results are assignable here.
export interface BatchLike {
  id: string;
  name?: string | null;
  cropId?: string | null;
  varietyId?: string | null;
  // Crop is required on a batch; variety is optional. Both are read from the
  // global catalog via the FK relations.
  crop?: { id: string; name: string } | null;
  variety?: { id: string; name: string } | null;
  status: BatchStatus;
  batchNumber?: string | null;
  greenhouseId?: string | null;
  plantingDate: string;
  cultivationArea: number;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
  totalPlants: number;
  lostPlants: number;
  greenhouse?: { id: string; name: string } | null;
}

// The slim harvest event: planting data lives on `batch`, measurements on
// `entries`, derived figures on `totals`.
export interface HarvestLike {
  id: string;
  batchId: string;
  date: string;
  photoUrls?: string[] | null;
  batch?: BatchLike | null;
  entries: HarvestEntryLike[];
  totals: HarvestTotalsLike;
}

import {
  BatchStatus,
  InputMode,
  type HarvestQualityClass,
} from '@/generated/graphql';

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
  // Crate mode only (null in weight mode): positional per-quality arrays
  // (index 0=A, 1=B, 2=C) of crate counts and remaining-kg tails. kg/total are
  // derived from the batch crateWeight.
  crateCounts?: number[] | null;
  remainingKgs?: number[] | null;
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
  // Per-quality crate-count sums, indexed 0=A,1=B,2=C; null off crate mode.
  crateCounts?: number[] | null;
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
  // Inclusive row range the batch occupies. Optional/nullable: legacy batches
  // are backfilled by hand, and a null range leaves harvest rows unconstrained.
  startRow?: number | null;
  endRow?: number | null;
  totalPlants: number;
  lostPlants: number;
  // Number of replicate input sets the harvest form should render. Optional on
  // the read model so older queries/fixtures without it still type-check; the
  // form falls back to 1 when absent.
  replicates?: number | null;
  // Yield input mode, fixed at creation. Optional on the read model so older
  // queries/fixtures without it still type-check; treated as weight when absent.
  inputMode?: InputMode | null;
  // Weight of one crate (kg) for crate-mode batches; null in weight mode.
  crateWeight?: number | null;
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

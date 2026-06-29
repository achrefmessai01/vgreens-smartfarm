import type { InputMode } from '@/generated/graphql';

export interface BatchFormData {
  // Cascading selection: greenhouse -> crop (required) -> variety (optional).
  // sourceGreenhouse / cropId / varietyId hold the selected entity ids.
  sourceGreenhouse: string;
  cropId: string;
  varietyId: string;
  plantingDate: string;
  cultivationArea: number;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
  // Start/end of the contiguous row block this batch occupies (inclusive). Both
  // optional: 0 means "unset" and is sent as undefined so the column stays null
  // (legacy batches are backfilled by hand). When both are set, start <= end.
  startRow: number;
  endRow: number;
  totalPlants: number;
  lostPlants: number;
  // Replicate samples per harvest; at least 1.
  replicates: number;
  // Average number of heads per plant. Tomato-only, optional metadata; 0 means
  // "unset" (the form's empty convention) and is persisted as null.
  avgHeadsPerPlant: number;
  // Length of a slab (cm). Tomato-only, optional metadata; 0 means "unset" (the
  // form's empty convention) and is persisted as null.
  slabLength: number;
  // Number of heads per slab. Tomato-only, optional metadata; 0 means "unset"
  // (the form's empty convention) and is persisted as null.
  headsPerSlab: number;
  // Yield input mode, fixed at creation. Drives the harvest layout (crate counts
  // vs direct kg). The crate WEIGHT is no longer a batch field — it's selected
  // per-harvest from the tenant's crates when logging a crate-mode harvest.
  inputMode: InputMode;
}

export interface BatchFormErrors {
  sourceGreenhouse?: string;
  cropId?: string;
  varietyId?: string;
  plantingDate?: string;
  cultivationArea?: string;
  numberOfRows?: string;
  rowLength?: string;
  plantsPerMeter?: string;
  startRow?: string;
  endRow?: string;
  totalPlants?: string;
  lostPlants?: string;
  replicates?: string;
}

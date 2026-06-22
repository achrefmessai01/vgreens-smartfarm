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
  // Yield input mode, fixed at creation. Crate mode requires a positive
  // crateWeight (kg per crate); in weight mode crateWeight is ignored.
  inputMode: InputMode;
  crateWeight: number;
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
  crateWeight?: string;
}

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
  totalPlants: number;
  lostPlants: number;
  // Replicate samples per harvest; at least 1.
  replicates: number;
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
  totalPlants?: string;
  lostPlants?: string;
  replicates?: string;
}

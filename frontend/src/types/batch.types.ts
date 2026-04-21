export interface BatchFormData {
  species: string;
  variety: string;
  plantingDate: string;
  cultivationArea: number;
  sourceGreenhouse: string;
  numberOfRows: number;
  rowLength: number;
  plantsPerMeter: number;
  rowSpacing: number;
}

export interface BatchFormErrors {
  species?: string;
  variety?: string;
  plantingDate?: string;
  cultivationArea?: string;
  sourceGreenhouse?: string;
  numberOfRows?: string;
  rowLength?: string;
  plantsPerMeter?: string;
}

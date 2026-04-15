export interface HarvestSummary {
  totalHarvests: number;
  variety: string;
  totalClassA: number;
  totalWaste: number;
  avgBrix: number;
}

export interface BatchFormData {
  species: string;
  variety: string;
  plantingDate: string;
  cultivationArea: number;
  sourceGreenhouseId: string;
}

export interface BatchFormErrors {
  species?: string;
  variety?: string;
  plantingDate?: string;
  cultivationArea?: string;
  sourceGreenhouseId?: string;
}

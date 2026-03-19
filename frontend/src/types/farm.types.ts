/** Dynamic: any _field name from InfluxDB getBucketFields (e.g. temperature, co2, soil_conductivity) */
export type ParameterType = string;

/** Dynamic: _field name -> latest numeric value from bucket data */
export type ParameterValue = Record<string, number>;

export interface PlantSlot {
  id: string;
  rowIndex: number;
  columnIndex: number;
  values: ParameterValue;
  meta?: Record<string, unknown>;
}

export interface Column {
  id: string;
  index: number;
  slots: PlantSlot[];
}

export interface Row {
  id: string;
  index: number;
  columns: Column[];
}

export interface Bay {
  id: string;
  name: string;
  index: number;
  rows: Row[];
  batchId: string | null;
}

export interface Batch {
  id: string;
  name: string;
  cropName: string;
  varietyId?: string;
  status: 'onTime' | 'delayed' | 'early';
  progress: number;
  startDate: Date;
  endDate: Date;
  bayIds: string[];
}

export interface Farm {
  bays: Bay[];
  batches: Batch[];
}

export interface HistoryDataPoint {
  timestamp: Date;
  value: number;
}

export interface HistoryData {
  parameter: ParameterType;
  timeRange: '1day' | '1week' | '1month';
  data: HistoryDataPoint[];
}

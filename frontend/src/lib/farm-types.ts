export type ParameterType =
  | 'fruitLoad'
  | 'canopyCover'
  | 'energyBalance'
  | 'temperature'
  | 'humidity'

export interface ParameterValue {
  fruitLoad: number // 0-13
  canopyCover: number // 0-1000 sq cm
  energyBalance: number // -100 to 100
  temperature: number // 19-22°C
  humidity: number // 0-100
}

export interface PlantSlot {
  id: string
  rowIndex: number
  columnIndex: number
  values: ParameterValue
}

export interface Column {
  id: string
  index: number
  slots: PlantSlot[]
}

export interface Row {
  id: string
  index: number
  columns: Column[]
}

export interface Bay {
  id: string
  name: string
  index: number
  rows: Row[]
  batchId: string | null
}

export interface Batch {
  id: string
  name: string
  cropName: string
  varietyId?: string // Variety ID if planted
  status: 'onTime' | 'delayed' | 'early'
  progress: number // 0-100
  startDate: Date
  endDate: Date
  bayIds: string[]
}

export interface Farm {
  bays: Bay[]
  batches: Batch[]
}

export interface HistoryDataPoint {
  timestamp: Date
  value: number
}

export interface HistoryData {
  parameter: ParameterType
  timeRange: '1day' | '1week' | '1month'
  data: HistoryDataPoint[]
}

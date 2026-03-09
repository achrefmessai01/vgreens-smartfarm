export interface HarvestRecord {
  id: string
  date: string
  batch: string
  classA: number
  waste: number
  avgBrix: number
  photos: number
  createdAt: string
  updatedAt: string
}

export interface HarvestSummary {
  totalHarvests: number
  variety: string
  totalClassA: number
  totalWaste: number
  avgBrix: number
}
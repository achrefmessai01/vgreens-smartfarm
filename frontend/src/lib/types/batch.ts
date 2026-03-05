export interface BatchFormData {
  species: string
  variety: string
  plantingDate: string
  cultivationArea: number
  sourceGreenhouseId: string
}

export interface BatchFormErrors {
  species?: string
  variety?: string
  plantingDate?: string
  cultivationArea?: string
  sourceGreenhouseId?: string
}
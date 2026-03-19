import { HarvestStatus } from '@/generated/graphql'
import type { BatchFormData } from '@/types/batch.types'
import type { BatchDetailsData } from '@/types/batch-sidebar.types'

export function getGreenhouseName(greenhouseId: string): string {
  const greenhouseMap: Record<string, string> = {
    'gh1': 'Green House 1',
    'gh2': 'Green House 2',
  }
  return greenhouseMap[greenhouseId] || `Green House ${greenhouseId.toUpperCase()}`
}

export function createBatchDetailsFromForm(formData: BatchFormData): BatchDetailsData {
  const plantingDate = new Date(formData.plantingDate)
  const today = new Date()
  const timeDiff = today.getTime() - plantingDate.getTime()
  const daysAfterPlanting = Math.floor(timeDiff / (1000 * 3600 * 24))

  return {
    id: `batch-${Date.now()}`,
    name: `${formData.species.charAt(0).toUpperCase() + formData.species.slice(1)} - ${formData.variety}`,
    species: formData.species.charAt(0).toUpperCase() + formData.species.slice(1),
    variety: formData.variety,
    status: HarvestStatus.Draft,
    greenhouse: {
      id: formData.sourceGreenhouseId,
      name: getGreenhouseName(formData.sourceGreenhouseId),
    },
    daysAfterPlanting: Math.max(0, daysAfterPlanting),
    area: formData.cultivationArea,
    plantingDate: formData.plantingDate,
    todaysHarvest: {
      marketable: 0,
      waste: 0,
    },
    brixMeasurements: {
      brix1: 0,
      brix2: 0,
      brix3: 0,
      brix4: 0,
      brix5: 0,
      brix6: 0,
      brix7: 0,
      brix8: 0,
      brix9: 0,
      brix10: 0,
    },
    photos: [],
  }
}
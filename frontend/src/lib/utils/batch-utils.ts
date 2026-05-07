import { HarvestStatus } from '@/generated/graphql';
import type { BatchFormData } from '@/types/batch.types';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';

export function getGreenhouseName(greenhouseId: string): string {
  return greenhouseId.trim() || '-';
}

export function createBatchDetailsFromForm(
  formData: BatchFormData,
): BatchDetailsData {
  const plantingDate = new Date(formData.plantingDate);
  const today = new Date();
  const timeDiff = today.getTime() - plantingDate.getTime();
  const daysAfterPlanting = Math.floor(timeDiff / (1000 * 3600 * 24));

  return {
    id: `batch-${Date.now()}`,
    name: `${formData.species.charAt(0).toUpperCase() + formData.species.slice(1)} - ${formData.variety}`,
    species:
      formData.species.charAt(0).toUpperCase() + formData.species.slice(1),
    variety: formData.variety,
    status: HarvestStatus.Draft,
    greenhouse: {
      id: formData.sourceGreenhouse,
      name: getGreenhouseName(formData.sourceGreenhouse),
    },
    daysAfterPlanting: Math.max(0, daysAfterPlanting),
    area: formData.cultivationArea,
    numberOfRows: formData.numberOfRows,
    rowLength: formData.rowLength,
    plantsPerMeter: formData.plantsPerMeter,
    rowSpacing: formData.rowSpacing,
    plantingDate: formData.plantingDate,
    todaysHarvest: {
      marketable: 0,
      waste: 0,
      classB: 0,
      rowX: 0,
      rowY: 0,
    },
    brixReadings: [0],
    photos: [],
  };
}

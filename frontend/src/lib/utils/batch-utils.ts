import { BatchStatus } from '@/generated/graphql';
import type { BatchFormData } from '@/types/batch.types';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { createEmptyEntry } from '@/types/batch-sidebar.types';

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
  const replicates = Math.max(1, formData.replicates ?? 1);

  return {
    id: `batch-${Date.now()}`,
    // crop/variety are now FK ids on the form; their display names come from the
    // server after creation, so this optimistic view-model leaves them blank.
    name: '',
    species: '',
    variety: '',
    status: BatchStatus.Active,
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
    startRow: formData.startRow || null,
    endRow: formData.endRow || null,
    totalPlants: formData.totalPlants,
    lostPlants: formData.lostPlants,
    replicates,
    plantingDate: formData.plantingDate,
    entries: Array.from({ length: replicates }, () => createEmptyEntry()),
    photos: [],
  };
}

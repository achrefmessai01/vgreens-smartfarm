import {
  HarvestStatus,
  type CreateHarvestInput,
  type UpdateHarvestInput,
} from '@/generated/graphql';
import { computeAvgBrix } from '@/lib/harvest-utils';
import type { BatchDetailsData } from '@/types/batch-sheet';

export function buildCreateEntryInput(
  parentBatchId: string,
  d: BatchDetailsData,
): CreateHarvestInput {
  const brix = d.brixMeasurements;
  return {
    parentBatchId,
    species: d.species,
    variety: d.variety,
    batch: d.name,
    greenhouse: d.greenhouse.id || d.greenhouse.name,
    plantingDate: d.plantingDate,
    cultivationArea: d.area,
    numberOfRows: d.numberOfRows,
    rowLength: d.rowLength,
    plantsPerMeter: d.plantsPerMeter,
    rowSpacing: d.rowSpacing,
    totalPlants: d.totalPlants,
    lostPlants: d.lostPlants,
    classA: d.todaysHarvest.marketable,
    waste: d.todaysHarvest.waste,
    avgBrix: computeAvgBrix(brix),
    rowX: d.todaysHarvest.rowX,
    rowY: d.todaysHarvest.rowY,
    ...brix,
    photos: d.photos.length,
    photoUrls: d.photos,
    date: new Date().toISOString(),
    status: HarvestStatus.Completed,
  };
}

export function buildUpdateEntryInput(d: BatchDetailsData): UpdateHarvestInput {
  const brix = d.brixMeasurements;
  return {
    classA: d.todaysHarvest.marketable,
    waste: d.todaysHarvest.waste,
    avgBrix: computeAvgBrix(brix),
    rowX: d.todaysHarvest.rowX,
    rowY: d.todaysHarvest.rowY,
    ...brix,
    photos: d.photos.length,
    photoUrls: d.photos,
    status: d.status,
  };
}

import { registerEnumType } from '@nestjs/graphql';

// Fields the harvest-entry list (grouped by batch) can be sorted on. All live
// on the parent batch / its catalog relations:
//   CROP          -> crops.name
//   GREENHOUSE    -> greenhouses.name
//   PLANTING_DATE -> batches.plantingDate
//   NAME          -> batches.name
//   MANUAL_ORDER  -> batches.sortOrder (the user's saved drag-and-drop order)
export enum HarvestSortField {
  CROP = 'CROP',
  GREENHOUSE = 'GREENHOUSE',
  PLANTING_DATE = 'PLANTING_DATE',
  NAME = 'NAME',
  MANUAL_ORDER = 'MANUAL_ORDER',
}

registerEnumType(HarvestSortField, {
  name: 'HarvestSortField',
  description: 'Sortable fields for the batch-grouped harvest list',
});

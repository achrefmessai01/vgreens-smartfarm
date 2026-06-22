import { registerEnumType } from '@nestjs/graphql';

// Fields the harvest-entry list (grouped by batch) can be sorted on. All three
// live on the parent batch / its catalog relations:
//   CROP          -> crops.name
//   GREENHOUSE    -> greenhouses.name
//   PLANTING_DATE -> batches.plantingDate
export enum HarvestSortField {
  CROP = 'CROP',
  GREENHOUSE = 'GREENHOUSE',
  PLANTING_DATE = 'PLANTING_DATE',
}

registerEnumType(HarvestSortField, {
  name: 'HarvestSortField',
  description: 'Sortable fields for the batch-grouped harvest list',
});

import { gql } from '@apollo/client';

const BATCH_FIELDS = gql`
  fragment BatchFields on Batch {
    id
    tenantId
    createdById
    greenhouseId
    cropId
    varietyId
    name
    batchNumber
    status
    plantingDate
    numberOfRows
    rowLength
    rowSpacing
    plantsPerMeter
    lostPlants
    cultivationArea
    totalPlants
    createdAt
    updatedAt
    greenhouse {
      id
      name
    }
    crop {
      id
      name
    }
    variety {
      id
      name
    }
  }
`;

export const BATCHES_QUERY = gql`
  query Batches($filter: BatchFilterInput, $sort: BatchSortInput) {
    batches(filter: $filter, sort: $sort) {
      ...BatchFields
    }
  }
  ${BATCH_FIELDS}
`;

export const BATCH_QUERY = gql`
  query Batch($id: ID!) {
    batch(id: $id) {
      ...BatchFields
    }
  }
  ${BATCH_FIELDS}
`;

// Lightweight batch list used by the harvest batch selector, with derived
// kg/plant.
export const HARVEST_BATCHES_QUERY = gql`
  query HarvestBatches {
    harvestBatches {
      id
      name
      species
      variety
      greenhouse
      plantingDate
      status
      yieldPerPlant
    }
  }
`;

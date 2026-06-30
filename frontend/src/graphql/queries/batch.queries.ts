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
    runningMeter
    rowSpacing
    startRow
    endRow
    plantsPerMeter
    lostPlants
    cultivationArea
    totalPlants
    replicates
    avgHeadsPerPlant
    slabLength
    headsPerSlab
    inputMode
    crateWeight
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
  query Batches(
    $filter: BatchFilterInput
    $sort: BatchSortInput
    $tenantId: ID
  ) {
    batches(filter: $filter, sort: $sort, tenantId: $tenantId) {
      ...BatchFields
    }
  }
  ${BATCH_FIELDS}
`;

export const BATCH_QUERY = gql`
  query Batch($id: ID!, $tenantId: ID) {
    batch(id: $id, tenantId: $tenantId) {
      ...BatchFields
    }
  }
  ${BATCH_FIELDS}
`;

// Lightweight batch list used by the harvest batch selector, with derived
// kg/plant.
export const HARVEST_BATCHES_QUERY = gql`
  query HarvestBatches($tenantId: ID) {
    harvestBatches(tenantId: $tenantId) {
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

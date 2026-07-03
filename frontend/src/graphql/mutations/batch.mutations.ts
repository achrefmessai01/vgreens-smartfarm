import { gql } from '@apollo/client';

const BATCH_MUTATION_FIELDS = gql`
  fragment BatchMutationFields on Batch {
    id
    tenantId
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
    avgHeadsPerPlant
    slabLength
    headsPerSlab
    crateWeight
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

export const CREATE_BATCH_MUTATION = gql`
  mutation CreateBatch($input: CreateBatchInput!) {
    createBatch(input: $input) {
      ...BatchMutationFields
    }
  }
  ${BATCH_MUTATION_FIELDS}
`;

export const UPDATE_BATCH_MUTATION = gql`
  mutation UpdateBatch($id: ID!, $input: UpdateBatchInput!, $tenantId: ID) {
    updateBatch(id: $id, input: $input, tenantId: $tenantId) {
      ...BatchMutationFields
    }
  }
  ${BATCH_MUTATION_FIELDS}
`;

export const DELETE_BATCH_MUTATION = gql`
  mutation DeleteBatch($id: ID!, $tenantId: ID) {
    deleteBatch(id: $id, tenantId: $tenantId)
  }
`;

// Persist a manual drag-and-drop order for the tenant's batches. `ids` is the
// full list in its new order; the server writes each id's position as its
// sortOrder and returns the batches in that order so the cache updates.
export const REORDER_BATCHES_MUTATION = gql`
  mutation ReorderBatches($ids: [ID!]!, $tenantId: ID) {
    reorderBatches(ids: $ids, tenantId: $tenantId) {
      id
      sortOrder
    }
  }
`;

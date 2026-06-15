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
    rowSpacing
    plantsPerMeter
    lostPlants
    cultivationArea
    totalPlants
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
  mutation UpdateBatch($id: ID!, $input: UpdateBatchInput!) {
    updateBatch(id: $id, input: $input) {
      ...BatchMutationFields
    }
  }
  ${BATCH_MUTATION_FIELDS}
`;

export const DELETE_BATCH_MUTATION = gql`
  mutation DeleteBatch($id: ID!) {
    deleteBatch(id: $id)
  }
`;

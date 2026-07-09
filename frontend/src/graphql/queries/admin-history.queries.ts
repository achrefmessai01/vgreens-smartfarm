import { gql } from '@apollo/client';

const DELETED_BATCH_FIELDS = gql`
  fragment DeletedBatchFields on Batch {
    id
    tenantId
    name
    batchNumber
    plantingDate
    deletedAt
    deletedById
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
    tenant {
      id
      name
    }
    deletedBy {
      id
      firstName
      lastName
      email
    }
  }
`;

const DELETED_HARVEST_FIELDS = gql`
  fragment DeletedHarvestFields on Harvest {
    id
    tenantId
    batchId
    date
    deletedAt
    deletedById
    batch {
      id
      name
      batchNumber
      greenhouse {
        id
        name
      }
      crop {
        id
        name
      }
    }
    tenant {
      id
      name
    }
    deletedBy {
      id
      firstName
      lastName
      email
    }
  }
`;

export const DELETED_BATCHES_QUERY = gql`
  query DeletedBatches($tenantId: ID) {
    deletedBatches(tenantId: $tenantId) {
      ...DeletedBatchFields
    }
  }
  ${DELETED_BATCH_FIELDS}
`;

export const DELETED_HARVESTS_QUERY = gql`
  query DeletedHarvests($tenantId: ID) {
    deletedHarvests(tenantId: $tenantId) {
      ...DeletedHarvestFields
    }
  }
  ${DELETED_HARVEST_FIELDS}
`;

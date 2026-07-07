import { gql } from '@apollo/client';

export const RESTORE_BATCH_MUTATION = gql`
  mutation RestoreBatch($id: ID!, $tenantId: ID) {
    restoreBatch(id: $id, tenantId: $tenantId) {
      id
      tenantId
      name
      batchNumber
      deletedAt
    }
  }
`;

export const RESTORE_HARVEST_MUTATION = gql`
  mutation RestoreHarvest($id: ID!, $tenantId: ID) {
    restoreHarvest(id: $id, tenantId: $tenantId) {
      id
      tenantId
      batchId
      date
      deletedAt
    }
  }
`;

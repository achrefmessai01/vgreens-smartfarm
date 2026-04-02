import { gql } from '@apollo/client';

export const UPSERT_FARM_CONFIG_MUTATION = gql`
  mutation UpsertFarmConfig($input: UpsertFarmConfigInput!, $tenantId: ID) {
    upsertFarmConfig(input: $input, tenantId: $tenantId) {
      id
      tenantId
      bayCount
      polesMax
      chambersCount
      updatedAt
    }
  }
`;

import { gql } from '@apollo/client';

export const FARM_CONFIG_QUERY = gql`
  query FarmConfig($tenantId: ID) {
    farmConfig(tenantId: $tenantId) {
      id
      tenantId
      bayCount
      polesMax
      chambersCount
      updatedAt
    }
  }
`;

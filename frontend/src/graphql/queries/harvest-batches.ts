import { gql } from '@apollo/client';

export const GET_HARVEST_BATCHES = gql`
  query GetHarvestBatches($tenantId: ID) {
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

import { gql } from '@apollo/client';

export const GET_HARVEST_BATCHES = gql`
  query GetHarvestBatches {
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

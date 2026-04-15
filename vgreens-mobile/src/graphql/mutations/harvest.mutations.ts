import { gql } from '@apollo/client';

export const CREATE_HARVEST_MUTATION = gql`
  mutation CreateHarvest($input: CreateHarvestInput!) {
    createHarvest(input: $input) {
      id
      tenantId
      species
      variety
      batch
      greenhouse
      plantingDate
      cultivationArea
      status
      date
      classA
      waste
      avgBrix
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_HARVEST_MUTATION = gql`
  mutation UpdateHarvest($id: ID!, $input: UpdateHarvestInput!) {
    updateHarvest(id: $id, input: $input) {
      id
      species
      variety
      batch
      greenhouse
      plantingDate
      cultivationArea
      date
      classA
      waste
      avgBrix
      updatedAt
    }
  }
`;

export const DELETE_HARVEST_MUTATION = gql`
  mutation DeleteHarvest($id: ID!) {
    deleteHarvest(id: $id)
  }
`;

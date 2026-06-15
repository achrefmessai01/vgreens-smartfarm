import { gql } from '@apollo/client';

const GREENHOUSE_MUTATION_FIELDS = gql`
  fragment GreenhouseMutationFields on Greenhouse {
    id
    tenantId
    name
    doorPosition
    xDimension
    yDimension
    bayCount
    isHorizontal
  }
`;

export const CREATE_GREENHOUSE_MUTATION = gql`
  mutation CreateGreenhouse($input: CreateGreenhouseInput!) {
    createGreenhouse(input: $input) {
      ...GreenhouseMutationFields
    }
  }
  ${GREENHOUSE_MUTATION_FIELDS}
`;

export const UPDATE_GREENHOUSE_MUTATION = gql`
  mutation UpdateGreenhouse($id: ID!, $input: UpdateGreenhouseInput!) {
    updateGreenhouse(id: $id, input: $input) {
      ...GreenhouseMutationFields
    }
  }
  ${GREENHOUSE_MUTATION_FIELDS}
`;

export const DELETE_GREENHOUSE_MUTATION = gql`
  mutation DeleteGreenhouse($id: ID!) {
    deleteGreenhouse(id: $id)
  }
`;

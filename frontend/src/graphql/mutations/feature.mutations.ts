import { gql } from '@apollo/client';

export const CREATE_FEATURE_MUTATION = gql`
  mutation CreateFeature($input: CreateFeatureInput!) {
    createFeature(input: $input) {
      id
      key
      name
      description
      category
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FEATURE_MUTATION = gql`
  mutation UpdateFeature($id: ID!, $input: UpdateFeatureInput!) {
    updateFeature(id: $id, input: $input) {
      id
      key
      name
      description
      category
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_FEATURE_MUTATION = gql`
  mutation DeleteFeature($id: ID!) {
    deleteFeature(id: $id)
  }
`;

export const TOGGLE_TENANT_FEATURE_MUTATION = gql`
  mutation ToggleTenantFeature($input: ToggleTenantFeatureInput!) {
    toggleTenantFeature(input: $input) {
      id
      tenantId
      featureId
      enabled
      createdAt
      updatedAt
      feature {
        id
        key
        name
        description
        category
        isActive
      }
    }
  }
`;

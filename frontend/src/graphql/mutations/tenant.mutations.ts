import { gql } from '@apollo/client';

export const CREATE_TENANT_MUTATION = gql`
  mutation CreateTenant($input: CreateTenantInput!) {
    createTenant(input: $input) {
      id
      name
      companyName
      email
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TENANT_MUTATION = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      name
      companyName
      email
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TENANT_MUTATION = gql`
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`;

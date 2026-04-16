import { gql } from '@apollo/client';

export const TENANTS_QUERY = gql`
  query Tenants {
    tenants {
      id
      name
      companyName
      email
      phone
      isActive
      greenhouses {
        name
        doorPosition
        xDimension
        yDimension
        bayCount
      }
      createdAt
      updatedAt
    }
  }
`;

export const TENANT_QUERY = gql`
  query Tenant($id: ID!) {
    tenant(id: $id) {
      id
      name
      companyName
      email
      phone
      isActive
      greenhouses {
        name
        doorPosition
        xDimension
        yDimension
        bayCount
      }
      createdAt
      updatedAt
      users {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const GET_TENANT_BUCKET_QUERY = gql`
  query GetTenantBucket($id: ID!) {
    tenant(id: $id) {
      id
      name
      influxBucketName
    }
  }
`;

export const TENANT_GREENHOUSES_QUERY = gql`
  query TenantGreenhouses($tenantId: ID) {
    tenantGreenhouses(tenantId: $tenantId)
  }
`;

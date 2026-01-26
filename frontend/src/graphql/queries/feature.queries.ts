import { gql } from '@apollo/client'

export const FEATURES_QUERY = gql`
  query Features {
    features {
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
`

export const FEATURES_WITH_TENANT_STATUS_QUERY = gql`
  query FeaturesWithTenantStatus($tenantId: ID) {
    featuresWithTenantStatus(tenantId: $tenantId) {
      id
      key
      name
      description
      category
      isActive
      enabledForTenant
      createdAt
      updatedAt
    }
  }
`

export const FEATURE_QUERY = gql`
  query Feature($id: ID!) {
    feature(id: $id) {
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
`

export const TENANT_FEATURES_QUERY = gql`
  query TenantFeatures($tenantId: ID) {
    tenantFeatures(tenantId: $tenantId) {
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
`

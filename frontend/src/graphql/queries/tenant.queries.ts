import { gql } from '@apollo/client'

export const TENANTS_QUERY = gql`
  query Tenants {
    tenants {
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
`

export const TENANT_QUERY = gql`
  query Tenant($id: ID!) {
    tenant(id: $id) {
      id
      name
      companyName
      email
      phone
      isActive
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
`

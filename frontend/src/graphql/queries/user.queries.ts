import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      tenant {
        id
        name
        influxBucketName
        createdAt
        isActive
        updatedAt
        settings {
          disabledSensorFields
          hiddenHarvestDashboardItems
          harvestDashboardOrder
        }
        allowedDomains
        greenhouses {
          name
          xDimension
          yDimension
          doorPosition
          bayCount
          isHorizontal
          hiddenInFarmOverview
        }
      }
      isActive
      status
      userSettings {
        preferredLanguage
        farmOverviewTimeRange
        harvestView {
          sort {
            field
            direction
          }
          range
          collapsedBatchIds
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($tenantId: ID) {
    users(tenantId: $tenantId) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      tenant {
        id
        name
        createdAt
        isActive
        updatedAt
        allowedDomains
      }
      isActive
      status
      createdAt
      updatedAt
    }
  }
`;

export const USER_QUERY = gql`
  query User($id: ID!, $tenantId: ID) {
    user(id: $id, tenantId: $tenantId) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      isActive
      createdAt
      updatedAt
    }
  }
`;

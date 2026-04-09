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
        greenhouses {
          name
          xDimension
          yDimension
        }
      }
      isActive
      status
      createdAt
      updatedAt
    }
  }
`;

export const USERS_QUERY = gql`
  query Users {
    users {
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
      }
      isActive
      status
      createdAt
      updatedAt
    }
  }
`;

export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
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

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
          doorPosition
          bayCount
        }
      }
      isActive
      status
      createdAt
      updatedAt
    }
  }
`;

import { gql } from '@apollo/client';

const GREENHOUSE_FIELDS = gql`
  fragment GreenhouseFields on Greenhouse {
    id
    tenantId
    name
    doorPosition
    xDimension
    yDimension
    bayCount
    isHorizontal
    createdAt
    updatedAt
  }
`;

export const GREENHOUSES_QUERY = gql`
  query Greenhouses($tenantId: ID) {
    greenhouses(tenantId: $tenantId) {
      ...GreenhouseFields
    }
  }
  ${GREENHOUSE_FIELDS}
`;

export const GREENHOUSE_QUERY = gql`
  query Greenhouse($id: ID!) {
    greenhouse(id: $id) {
      ...GreenhouseFields
    }
  }
  ${GREENHOUSE_FIELDS}
`;

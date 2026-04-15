import { gql } from '@apollo/client';

export const ALERTS_QUERY = gql`
  query Alerts($filter: AlertsFilterInput) {
    alerts(filter: $filter) {
      id
      tenantId
      tunnelId
      sensorName
      value
      status
      severity
      description
      timestamp
      field
      measurement
      device
      greenhouse
      city
      column
      row
      profile
      acknowledgedById
      acknowledgedTime
      acknowledgedBy {
        id
        firstName
        lastName
        email
      }
      resolvedById
      resolvedTime
      resolvedBy {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
      tenant {
        id
        name
      }
    }
  }
`;

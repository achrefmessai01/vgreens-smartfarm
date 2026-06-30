import { gql } from '@apollo/client';

export const ALERTS_QUERY = gql`
  query Alerts($filter: AlertsFilterInput, $tenantId: ID) {
    alerts(filter: $filter, tenantId: $tenantId) {
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

export const ALERT_QUERY = gql`
  query Alert($id: ID!, $tenantId: ID) {
    alert(id: $id, tenantId: $tenantId) {
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

export const CREATE_ALERT_MUTATION = gql`
  mutation CreateAlert($input: CreateAlertInput!) {
    createAlert(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ALERT_MUTATION = gql`
  mutation UpdateAlert($id: ID!, $input: UpdateAlertInput!, $tenantId: ID) {
    updateAlert(id: $id, input: $input, tenantId: $tenantId) {
      id
      tenantId
      tunnelId
      sensorName
      value
      status
      severity
      timestamp
      description
      field
      measurement
      device
      greenhouse
      city
      column
      row
      profile
      createdAt
      updatedAt
    }
  }
`;

export const ACKNOWLEDGE_ALERT_MUTATION = gql`
  mutation AcknowledgeAlert($id: ID!, $tenantId: ID) {
    acknowledgeAlert(id: $id, tenantId: $tenantId) {
      id
      status
      updatedAt
    }
  }
`;

export const RESOLVE_ALERT_MUTATION = gql`
  mutation ResolveAlert($id: ID!, $tenantId: ID) {
    resolveAlert(id: $id, tenantId: $tenantId) {
      id
      status
      updatedAt
    }
  }
`;

export const SOFT_DELETE_ALERT_MUTATION = gql`
  mutation SoftDeleteAlert($id: ID!, $tenantId: ID) {
    softDeleteAlert(id: $id, tenantId: $tenantId)
  }
`;

export const DELETE_ALERT_MUTATION = gql`
  mutation DeleteAlert($id: ID!, $tenantId: ID) {
    deleteAlert(id: $id, tenantId: $tenantId)
  }
`;

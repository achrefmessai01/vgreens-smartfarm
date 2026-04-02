import { gql } from '@apollo/client';

export const UPSERT_SENSOR_CONFIG_MUTATION = gql`
  mutation UpsertSensorConfig($input: UpsertSensorConfigInput!, $tenantId: ID) {
    upsertSensorConfig(input: $input, tenantId: $tenantId) {
      id
      tenantId
      device
      bay
      pole
      row
      greenhouse
      city
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SENSOR_CONFIG_MUTATION = gql`
  mutation DeleteSensorConfig($id: ID!, $tenantId: ID) {
    deleteSensorConfig(id: $id, tenantId: $tenantId)
  }
`;

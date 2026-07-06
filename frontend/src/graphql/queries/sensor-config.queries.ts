import { gql } from '@apollo/client';

export const SENSOR_CONFIGS_QUERY = gql`
  query SensorConfigs($tenantId: ID) {
    sensorConfigs(tenantId: $tenantId) {
      id
      tenantId
      device
      profile
      xPosition
      yPosition
      greenhouseId
      greenhouse
      city
      hiddenInFarmOverview
      createdAt
      updatedAt
    }
  }
`;

export const SENSOR_DEVICES_QUERY = gql`
  query SensorDevices($tenantId: ID) {
    sensorDevices(tenantId: $tenantId) {
      device
      profile
    }
  }
`;

export const GREENHOUSE_OPTIONS_QUERY = gql`
  query GreenhouseOptions($tenantId: ID) {
    greenhouseOptions(tenantId: $tenantId)
  }
`;

import { gql } from '@apollo/client';

/**
 * The tenant's soil sensor configs (not hidden), with their calibration bounds.
 * Powers the calibration dropdown AND the map's corrected-value rendering.
 */
export const SOIL_SENSOR_CONFIGS_QUERY = gql`
  query SoilSensorConfigs($tenantId: ID) {
    soilSensorConfigs(tenantId: $tenantId) {
      id
      device
      greenhouse
      avgDryReading
      avgSaturatedReading
      isCalibrated
    }
  }
`;

/**
 * First real soil-moisture datapoint at or after `since` (null until the sensor
 * transmits). Polled during capture to detect the first genuine reading.
 */
export const CALIBRATION_READING_QUERY = gql`
  query CalibrationReading($sensorConfigId: ID!, $since: String!, $tenantId: ID) {
    calibrationReading(
      sensorConfigId: $sensorConfigId
      since: $since
      tenantId: $tenantId
    ) {
      value
      time
    }
  }
`;

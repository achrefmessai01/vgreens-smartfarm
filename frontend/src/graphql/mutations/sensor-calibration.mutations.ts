import { gql } from '@apollo/client';

/**
 * Capture the DRY / SATURATED calibration bound. The server takes the first
 * real reading since `since` (the ISO timestamp stamped when the operator
 * pressed calibrate), averages it, and persists it atomically.
 */
export const CAPTURE_DRY_CALIBRATION_MUTATION = gql`
  mutation CaptureDryCalibration(
    $sensorConfigId: ID!
    $since: String!
    $tenantId: ID
  ) {
    captureDryCalibration(
      sensorConfigId: $sensorConfigId
      since: $since
      tenantId: $tenantId
    ) {
      id
      device
      avgDryReading
      avgSaturatedReading
      isCalibrated
    }
  }
`;

export const CAPTURE_SATURATED_CALIBRATION_MUTATION = gql`
  mutation CaptureSaturatedCalibration(
    $sensorConfigId: ID!
    $since: String!
    $tenantId: ID
  ) {
    captureSaturatedCalibration(
      sensorConfigId: $sensorConfigId
      since: $since
      tenantId: $tenantId
    ) {
      id
      device
      avgDryReading
      avgSaturatedReading
      isCalibrated
    }
  }
`;

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

/**
 * Clear the DRY / SATURATED calibration bound without recapturing (discard a
 * calibration taken under the wrong conditions). With either bound null the
 * sensor renders its raw reading again.
 */
export const CLEAR_DRY_CALIBRATION_MUTATION = gql`
  mutation ClearDryCalibration($sensorConfigId: ID!, $tenantId: ID) {
    clearDryCalibration(sensorConfigId: $sensorConfigId, tenantId: $tenantId) {
      id
      device
      avgDryReading
      avgSaturatedReading
      isCalibrated
    }
  }
`;

export const CLEAR_SATURATED_CALIBRATION_MUTATION = gql`
  mutation ClearSaturatedCalibration($sensorConfigId: ID!, $tenantId: ID) {
    clearSaturatedCalibration(
      sensorConfigId: $sensorConfigId
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

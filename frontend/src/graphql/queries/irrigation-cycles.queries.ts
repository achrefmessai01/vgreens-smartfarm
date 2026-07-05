import { gql } from '@apollo/client';

/**
 * The tenant's irrigation cycles with their assigned soil sensors and each
 * sensor's calibration bounds. Powers the Farm-Overview-Configuration section
 * and the farm-overview calibration dropdown + sidebar. Admin-only (enforced
 * server-side).
 */
export const IRRIGATION_CYCLES_QUERY = gql`
  query IrrigationCycles($tenantId: ID) {
    irrigationCycles(tenantId: $tenantId) {
      id
      name
      greenhouseId
      greenhouse
      sensors {
        id
        device
        greenhouseId
        irrigationCycleId
        avgDryReading
        avgSaturatedReading
        isCalibrated
      }
    }
  }
`;

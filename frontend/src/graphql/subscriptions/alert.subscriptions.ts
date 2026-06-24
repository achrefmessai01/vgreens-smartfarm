import { gql } from '@apollo/client';

/**
 * VSL-97: real-time push of newly-created alerts, used to drive toast
 * notifications instead of 30s polling. Fields mirror what the toast formatter
 * (`formatAlertDescription` / `getAlertTimestamp`) needs, plus the identifiers
 * for tenant scoping and de-duplication.
 *
 * Codegen will generate `useAlertCreatedSubscription` from this document the
 * next time `npm run codegen` runs against a running backend; until then the
 * toast listener uses Apollo's `useSubscription` with this document directly.
 */
export const ALERT_CREATED_SUBSCRIPTION = gql`
  subscription AlertCreated {
    alertCreated {
      id
      tenantId
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

import { gql } from '@apollo/client';

export const GET_RECENT_SYSTEM_ERRORS = gql`
  query GetRecentSystemErrors(
    $limit: Float
    $severity: ReportSeverity
    $source: ErrorSource
    $isResolved: Boolean
  ) {
    getRecentSystemErrors(
      limit: $limit
      severity: $severity
      source: $source
      isResolved: $isResolved
    ) {
      id
      source
      errorType
      severity
      errorMessage
      component
      action
      occurrenceCount
      isResolved
      createdAt
      updatedAt
      lastOccurredAt
      user {
        firstName
        lastName
        email
        id
        isActive
        createdAt
        updatedAt
        clerkUserId
        role
      }
      tenant {
        id
        isActive
        createdAt
        updatedAt
        name
        disabledSensorFields
        hiddenHarvestDashboardItems
      }
    }
  }
`;

export const GET_SYSTEM_ERROR_STATS = gql`
  query GetSystemErrorStats($hours: Float) {
    getSystemErrorStats(hours: $hours)
  }
`;

export const RESOLVE_SYSTEM_ERROR = gql`
  mutation ResolveSystemError($errorId: ID!, $resolutionNotes: String) {
    resolveSystemError(errorId: $errorId, resolutionNotes: $resolutionNotes) {
      id
      isResolved
      resolvedAt
    }
  }
`;

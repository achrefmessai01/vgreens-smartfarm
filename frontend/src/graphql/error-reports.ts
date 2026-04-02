import { gql } from '@apollo/client';

// Error Report Fragment
const ERROR_REPORT_FRAGMENT = gql`
  fragment ErrorReportFragment on ErrorReport {
    id
    userEmail
    errorTitle
    errorDetails
    severity
    status
    reproductionSteps
    expectedVsActual
    browserInfo
    attachments
    adminNotes
    isResolved
    resolvedAt
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
      email
    }
    tenant {
      id
      name
    }
    resolvedByUser {
      id
      firstName
      lastName
      email
    }
  }
`;

// Create Error Report Mutation
export const CREATE_ERROR_REPORT = gql`
  mutation CreateErrorReport($input: CreateErrorReportInput!) {
    createErrorReport(input: $input) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Update Error Report Mutation
export const UPDATE_ERROR_REPORT = gql`
  mutation UpdateErrorReport($id: ID!, $input: UpdateErrorReportInput!) {
    updateErrorReport(id: $id, input: $input) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Update Error Report Status Mutation
export const UPDATE_ERROR_REPORT_STATUS = gql`
  mutation UpdateErrorReportStatus($id: ID!, $status: String!) {
    updateErrorReportStatus(id: $id, status: $status) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Resolve Error Report Mutation
export const RESOLVE_ERROR_REPORT = gql`
  mutation ResolveErrorReport($id: ID!, $adminNotes: String) {
    resolveErrorReport(id: $id, adminNotes: $adminNotes) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Delete Error Report Mutation
export const DELETE_ERROR_REPORT = gql`
  mutation DeleteErrorReport($id: ID!) {
    deleteErrorReport(id: $id)
  }
`;

// Get all error reports with filtering
export const GET_ERROR_REPORTS = gql`
  query GetErrorReports($filter: ErrorReportsFilterInput) {
    errorReports(filter: $filter) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Get single error report by ID
export const GET_ERROR_REPORT = gql`
  query GetErrorReport($id: ID!) {
    errorReport(id: $id) {
      ...ErrorReportFragment
    }
  }
  ${ERROR_REPORT_FRAGMENT}
`;

// Get unresolved error reports count for dashboard
export const GET_UNRESOLVED_ERROR_REPORTS_COUNT = gql`
  query GetUnresolvedErrorReportsCount {
    unresolvedErrorReportsCount
  }
`;

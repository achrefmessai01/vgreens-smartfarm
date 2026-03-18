import { useMutation, useQuery } from '@apollo/client';
import { 
  CREATE_ERROR_REPORT, 
  UPDATE_ERROR_REPORT, 
  UPDATE_ERROR_REPORT_STATUS,
  RESOLVE_ERROR_REPORT, 
  DELETE_ERROR_REPORT,
  GET_ERROR_REPORTS,
  GET_ERROR_REPORT,
  GET_UNRESOLVED_ERROR_REPORTS_COUNT
} from '@/graphql/error-reports';
import { 
  CreateErrorReportInput, 
  UpdateErrorReportInput, 
  ErrorReportsFilterInput,
  ErrorReport 
} from '@/generated/graphql';

// Hook for creating error reports
export const useCreateErrorReport = () => {
  return useMutation(CREATE_ERROR_REPORT, {
    refetchQueries: ['GetErrorReports', 'GetUnresolvedErrorReportsCount']
  });
};

// Hook for updating error reports (admin only)
export const useUpdateErrorReport = () => {
  return useMutation(UPDATE_ERROR_REPORT, {
    refetchQueries: ['GetErrorReports', 'GetUnresolvedErrorReportsCount']
  });
};

// Hook for updating error report status (admin only)
export const useUpdateErrorReportStatus = () => {
  return useMutation(UPDATE_ERROR_REPORT_STATUS, {
    refetchQueries: ['GetErrorReports', 'GetUnresolvedErrorReportsCount']
  });
};

// Hook for resolving error reports (admin only)
export const useResolveErrorReport = () => {
  return useMutation(RESOLVE_ERROR_REPORT, {
    refetchQueries: ['GetErrorReports', 'GetUnresolvedErrorReportsCount']
  });
};

// Hook for deleting error reports (admin only)
export const useDeleteErrorReport = () => {
  return useMutation(DELETE_ERROR_REPORT, {
    refetchQueries: ['GetErrorReports', 'GetUnresolvedErrorReportsCount']
  });
};

// Hook for fetching error reports with filtering
export const useErrorReports = (filter?: ErrorReportsFilterInput) => {
  return useQuery(GET_ERROR_REPORTS, {
    variables: { filter },
    errorPolicy: 'all'
  });
};

// Hook for fetching a single error report
export const useErrorReport = (id: string) => {
  return useQuery(GET_ERROR_REPORT, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all'
  });
};

// Hook for getting unresolved reports count (dashboard)
export const useUnresolvedErrorReportsCount = () => {
  return useQuery(GET_UNRESOLVED_ERROR_REPORTS_COUNT, {
    errorPolicy: 'all',
    pollInterval: 60000, // Poll every minute for real-time updates
  });
};

// Complete hook that provides all error report operations
export const useErrorReportOperations = () => {
  const [createErrorReport] = useCreateErrorReport();
  const [updateErrorReport] = useUpdateErrorReport();
  const [resolveErrorReport] = useResolveErrorReport();
  const [deleteErrorReport] = useDeleteErrorReport();

  return {
    createErrorReport,
    updateErrorReport,
    resolveErrorReport,
    deleteErrorReport,
  };
};
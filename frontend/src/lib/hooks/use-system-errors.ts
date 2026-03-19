import { 
  useGetRecentSystemErrorsQuery,
  useGetSystemErrorStatsQuery,
  useResolveSystemErrorMutation,
  GetRecentSystemErrorsQueryVariables,
  SystemError,
  ReportSeverity,
  ErrorSource
} from '@/generated/graphql';

// Hook for fetching recent system errors
export const useSystemErrors = (variables?: GetRecentSystemErrorsQueryVariables) => {
  return useGetRecentSystemErrorsQuery({
    variables: {
      limit: 50,
      ...variables
    },
    pollInterval: 30000, // Poll every 30 seconds for new errors
    errorPolicy: 'all'
  });
};

// Hook for fetching system error statistics
export const useSystemErrorStats = (hours?: number) => {
  return useGetSystemErrorStatsQuery({
    variables: { hours },
    pollInterval: 60000, // Poll every minute for updated stats
    errorPolicy: 'all'
  });
};

// Hook for resolving system errors (admin only)
export const useResolveSystemError = () => {
  return useResolveSystemErrorMutation({
    refetchQueries: ['GetRecentSystemErrors', 'GetSystemErrorStats']
  });
};

// Hook with filtering capabilities
export const useFilteredSystemErrors = (filters: {
  severity?: ReportSeverity;
  source?: ErrorSource;
  isResolved?: boolean;
  limit?: number;
}) => {
  return useSystemErrors({
    limit: filters.limit || 50,
    severity: filters.severity,
    source: filters.source,
    isResolved: filters.isResolved
  });
};

export type { SystemError } from '@/generated/graphql';
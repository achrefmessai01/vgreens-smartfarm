import { onError } from '@apollo/client/link/error';
import { ApolloLink, Observable } from '@apollo/client';
import type { ServerError } from '@apollo/client/link/utils';
import { errorLogger } from '@/lib/error-logging';
import { ErrorType, ReportSeverity } from '@/types/error-types';

/**
 * Apollo Client error link that logs all GraphQL errors
 */
export const apolloErrorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        const errorContext = {
          operationName: operation.operationName,
          variables: operation.variables,
          query: operation.query.loc?.source.body,
          path,
          locations,
          extensions,
        };

        errorLogger.logError({
          errorMessage: `GraphQL Error: ${message}`,
          component: 'apollo-client',
          action: operation.operationName || 'unknown',
          errorType: ErrorType.API_ERROR,
          severity:
            extensions?.code === 'UNAUTHENTICATED'
              ? ReportSeverity.Medium
              : ReportSeverity.High,
          metadata: errorContext,
          requestUrl: `GraphQL: ${operation.operationName}`,
          httpMethod: 'POST',
        });
      });
    }

    if (networkError) {
      const serverError = networkError as ServerError;
      const statusCode =
        serverError?.statusCode ?? serverError?.response?.status ?? 0;

      errorLogger.logNetworkError(
        'GraphQL Endpoint',
        'POST',
        statusCode,
        `Network Error: ${networkError.message}`,
      );
    }
  },
);

/**
 * Request logging link for tracking all GraphQL operations
 */
export const apolloRequestLoggingLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  return new Observable((observer) => {
    forward(operation).subscribe({
      next: (result) => {
        const duration = Date.now() - startTime;

        // Log slow queries (>2 seconds) as potential issues
        if (duration > 2000) {
          errorLogger.logError({
            errorMessage: `Slow GraphQL Query: ${operation.operationName} took ${duration}ms`,
            component: 'apollo-client',
            action: operation.operationName || 'unknown',
            errorType: ErrorType.TIMEOUT_ERROR,
            severity: ReportSeverity.Medium,
            metadata: {
              duration,
              variables: operation.variables,
              operationName: operation.operationName,
            },
            requestUrl: `GraphQL: ${operation.operationName}`,
            httpMethod: 'POST',
          });
        }

        observer.next(result);
      },
      error: (error) => {
        const duration = Date.now() - startTime;

        errorLogger.logError({
          errorMessage: `GraphQL Operation Failed: ${error.message}`,
          stackTrace: error.stack,
          component: 'apollo-client',
          action: operation.operationName || 'unknown',
          errorType: ErrorType.API_ERROR,
          severity: ReportSeverity.High,
          metadata: {
            duration,
            variables: operation.variables,
            operationName: operation.operationName,
            error: error.toString(),
          },
          requestUrl: `GraphQL: ${operation.operationName}`,
          httpMethod: 'POST',
        });

        observer.error(error);
      },
      complete: () => {
        observer.complete();
      },
    });
  });
});

// Re-export for backward compatibility
export const errorLink = apolloErrorLink;
export const requestLoggingLink = apolloRequestLoggingLink;

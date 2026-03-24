import { onError } from '@apollo/client/link/error';
import { ApolloLink, Observable } from '@apollo/client';
import type { ServerError } from '@apollo/client/link/utils';

/**
 * Apollo error link — console-only logging.
 * GraphQL errors (auth, validation, rate limits) are not app crashes
 * and should not be written to the database.
 */
export const apolloErrorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error] op=${operation.operationName} message=${message}`,
          { locations, path },
        );
      });
    }

    if (networkError) {
      const serverError = networkError as ServerError;
      const statusCode = serverError?.statusCode ?? serverError?.response?.status ?? 0;
      console.error(
        `[Network error] op=${operation.operationName} status=${statusCode}`,
        networkError.message,
      );
    }
  },
);

/**
 * Request logging link — pass-through only.
 * Slow query metrics are not app crashes and should not pollute the error DB.
 */
export const apolloRequestLoggingLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    forward(operation).subscribe({
      next: (result) => observer.next(result),
      error: (error) => {
        console.error(`[GraphQL operation failed] op=${operation.operationName}`, error);
        observer.error(error);
      },
      complete: () => observer.complete(),
    });
  });
});

// Re-export for backward compatibility
export const errorLink = apolloErrorLink;
export const requestLoggingLink = apolloRequestLoggingLink;

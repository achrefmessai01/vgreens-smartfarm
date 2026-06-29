import { onError } from '@apollo/client/link/error';
import { ApolloLink, Observable } from '@apollo/client';
import type { ServerError } from '@apollo/client/link/utils';

const EXPECTED_LIVESTREAM_UNAVAILABLE_MESSAGE =
  'Camera livestream is not available for this account';

// GraphQL error codes for expected, client-recoverable problems (validation,
// conflicts, auth, missing resources). The UI surfaces these inline, so logging
// them as console errors is just noise — and in dev it also trips the Next.js
// error overlay. Genuine server faults (INTERNAL_SERVER_ERROR) and network
// errors still log loudly. Codes are set by the backend GraphQLExceptionFilter.
const EXPECTED_CLIENT_ERROR_CODES = new Set([
  'BAD_USER_INPUT',
  'CONFLICT',
  'NOT_FOUND',
  'FORBIDDEN',
  'UNAUTHENTICATED',
]);

// The backend flattens errors to `{ message, code }`, so the code is top-level;
// fall back to the standard `extensions.code` in case that changes.
function expectedClientErrorCode(error: {
  code?: unknown;
  extensions?: { code?: unknown } | null;
}): boolean {
  const code = error.code ?? error.extensions?.code;
  return typeof code === 'string' && EXPECTED_CLIENT_ERROR_CODES.has(code);
}

function isExpectedLivestreamUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    message?: unknown;
    graphQLErrors?: Array<{ message?: unknown }>;
  };

  if (maybeError.message === EXPECTED_LIVESTREAM_UNAVAILABLE_MESSAGE) {
    return true;
  }

  return (
    maybeError.graphQLErrors?.some(
      (graphQLError) =>
        graphQLError.message === EXPECTED_LIVESTREAM_UNAVAILABLE_MESSAGE,
    ) ?? false
  );
}

/**
 * Apollo error link — console-only logging.
 * GraphQL errors (auth, validation, rate limits) are not app crashes
 * and should not be written to the database.
 */
export const apolloErrorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((graphQLError) => {
        const { message, locations, path, extensions } = graphQLError;
        if (message === EXPECTED_LIVESTREAM_UNAVAILABLE_MESSAGE) {
          return;
        }
        // Expected client errors are handled inline by the UI — don't log them
        // as crashes (and don't trip the Next.js dev error overlay).
        if (expectedClientErrorCode(graphQLError)) {
          return;
        }

        console.error(
          `[GraphQL error] op=${operation.operationName} message=${message}`,
          { locations, path, extensions },
        );
      });
    }

    if (networkError) {
      const serverError = networkError as ServerError;
      const statusCode =
        serverError?.statusCode ?? serverError?.response?.status ?? 0;
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
        if (isExpectedLivestreamUnavailableError(error)) {
          observer.error(error);
          return;
        }

        console.error(
          `[GraphQL operation failed] op=${operation.operationName}`,
          error,
        );
        observer.error(error);
      },
      complete: () => observer.complete(),
    });
  });
});

// Re-export for backward compatibility
export const errorLink = apolloErrorLink;
export const requestLoggingLink = apolloRequestLoggingLink;

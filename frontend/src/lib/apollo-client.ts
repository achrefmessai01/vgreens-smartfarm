import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  type FetchResult,
} from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import {
  apolloErrorLink,
  apolloRequestLoggingLink,
} from './apollo-error-handling';

export const createApolloClient = (
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>,
) => {
  const errorLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          // Handle GraphQL errors
          if (result.errors) {
            result.errors.forEach((error) => {
              const { message, locations, path, extensions } = error;
              console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
              );

              // Handle rate limit errors separately
              if (
                extensions?.code === 'RATE_LIMIT_EXCEEDED' ||
                extensions?.statusCode === 429 ||
                message.includes('Too Many Requests')
              ) {
                console.warn(
                  '[GraphQL error]: Rate limit exceeded - too many requests',
                );
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('apollo-rate-limit-error', {
                      detail: { message, operation },
                    }),
                  );
                }
              }

              // Handle authentication errors
              if (extensions?.code === 'UNAUTHENTICATED') {
                if (typeof window !== 'undefined') {
                  window.location.href =
                    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
                    '/auth/clinic/sign-in';
                }
              }
            });
          }
          observer.next(result);
        },
        error: (networkError) => {
          console.error(`[Network error]: ${networkError}`);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('apollo-network-error'));
          }
          observer.error(networkError);
        },
        complete: () => {
          observer.complete();
        },
      });
      return subscription;
    });
  });

  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  if (!graphqlEndpoint) {
    throw new Error(
      'NEXT_PUBLIC_GRAPHQL_ENDPOINT is not set. Configure it in your environment (Fly secrets or .env).',
    );
  }

  const httpLink = createUploadLink({
    uri: graphqlEndpoint,
    credentials: 'include',
    headers: {
      'apollo-require-preflight': 'true',
    },
  }) as unknown as ApolloLink;

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      // Always get a fresh token, skip Clerk's cache to avoid expired tokens
      getToken({ skipCache: true })
        .then((token) => {
          console.log('[Apollo Auth] Token retrieved:', {
            hasToken: !!token,
            tokenLength: token?.length,
            tokenPrefix: token?.substring(0, 20),
            operation: operation.operationName,
          });

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : '',
              'x-client-url':
                typeof window !== 'undefined' ? window.location.href : '',
            },
          }));
          const subscription = forward(operation).subscribe(observer);
          return subscription;
        })
        .catch((error) => {
          console.error('[Apollo Auth] Failed to get token:', error);
          observer.error(error);
        });
    });
  });

  return new ApolloClient({
    link: ApolloLink.from([
      apolloErrorLink, // Enhanced error logging system
      apolloRequestLoggingLink, // Request performance tracking
      authLink,
      httpLink,
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

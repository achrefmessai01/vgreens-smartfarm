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
      // Prefer Clerk token cache to avoid auth round-trips on every route/query.
      getToken()
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
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  split,
  type FetchResult,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
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

  // HTTP chain for queries/mutations (unchanged behaviour).
  const httpChain = ApolloLink.from([
    apolloErrorLink, // Enhanced error logging system
    apolloRequestLoggingLink, // Request performance tracking
    authLink,
    httpLink,
  ]);

  // VSL-97: WebSocket link for GraphQL subscriptions (e.g. alertCreated).
  // Created client-side only (no `window` during SSR). The Clerk token is
  // passed in `connectionParams` so the backend can authenticate the socket
  // the same way it authenticates HTTP requests. Queries/mutations are NOT
  // affected — only subscription operations are routed here via `split`.
  const wsEndpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ??
    graphqlEndpoint.replace(/^http/, 'ws');

  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: wsEndpoint,
            // graphql-ws is lazy by default: the socket only opens when there
            // is an active subscription, so gated-off users never connect.
            connectionParams: async () => {
              const token = await getToken();
              return token ? { authorization: `Bearer ${token}` } : {};
            },
          }),
        )
      : null;

  // Route subscriptions to the WS link, everything else to the HTTP chain.
  const link = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpChain,
      )
    : httpChain;

  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        // The consolidated settings blobs (VSL-279) are un-normalized objects
        // cached on their parent entity. Different documents select different
        // subsets of their keys (e.g. the i18n sync only reads
        // userSettings.preferredLanguage), and Apollo's default is to REPLACE
        // the whole object on write — dropping the keys the narrower document
        // didn't select. Shallow-merging keeps every key that was ever
        // fetched/written.
        User: {
          fields: {
            userSettings: {
              // A null incoming value wins (the server cleared the blob);
              // otherwise merge keys over whatever is already cached.
              merge: (existing: object | null, incoming: object | null) =>
                existing == null || incoming == null
                  ? incoming
                  : { ...existing, ...incoming },
            },
          },
        },
        Tenant: {
          fields: {
            settings: {
              merge: (existing: object | null, incoming: object | null) =>
                existing == null || incoming == null
                  ? incoming
                  : { ...existing, ...incoming },
            },
          },
        },
      },
    }),
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

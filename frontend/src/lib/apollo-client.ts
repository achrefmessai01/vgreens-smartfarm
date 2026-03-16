import {
  ApolloLink,
  ApolloClient,
  InMemoryCache,
  Observable,
  type FetchResult,
} from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { apolloErrorLink, apolloRequestLoggingLink } from './apollo-error-handling';

export const createApolloClient = (getToken: () => Promise<string | null>) => {
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
      getToken()
        .then((token) => {
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
          observer.error(error);
        });
    });
  });

  return new ApolloClient({
    link: ApolloLink.from([
      apolloErrorLink,          // Enhanced error logging system
      apolloRequestLoggingLink, // Request performance tracking
      authLink, 
      httpLink
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

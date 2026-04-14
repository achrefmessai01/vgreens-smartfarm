import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  type FetchResult,
} from '@apollo/client';

export const createApolloClient = (
  getToken: () => Promise<string | null>,
) => {
  const graphqlEndpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT;

  if (!graphqlEndpoint) {
    throw new Error(
      'EXPO_PUBLIC_GRAPHQL_ENDPOINT is not set. Add it to your .env file.',
    );
  }

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
  });

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      getToken()
        .then((token) => {
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : '',
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

  const errorLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          if (result.errors) {
            result.errors.forEach((error) => {
              console.error(
                `[GraphQL error]: Message: ${error.message}, Path: ${error.path}`,
              );
            });
          }
          observer.next(result);
        },
        error: (networkError) => {
          console.error(`[Network error]: ${networkError}`);
          observer.error(networkError);
        },
        complete: () => observer.complete(),
      });
      return subscription;
    });
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
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

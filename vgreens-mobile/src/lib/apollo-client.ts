import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  type FetchResult,
} from '@apollo/client';
// Use upload link so the `uploadImage` mutation can send multipart/form-data files.
// The .mjs path is required to pick up the ESM build that re-exports createUploadLink.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — no bundled types for the sub-path export.
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

export const createApolloClient = (
  getToken: () => Promise<string | null>,
) => {
  const graphqlEndpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT;

  if (!graphqlEndpoint) {
    throw new Error(
      'EXPO_PUBLIC_GRAPHQL_ENDPOINT is not set. Add it to your .env file.',
    );
  }

  const httpLink = createUploadLink({
    uri: graphqlEndpoint,
    headers: { 'apollo-require-preflight': 'true' },
  }) as unknown as ApolloLink;

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      // Track the inner forward() subscription + a cancellation flag so that
      // when an Apollo subscriber unsubscribes (e.g. component unmounts while
      // the token request is still in flight) we don't leak a downstream
      // network request that nobody is reading from.
      let innerSub: { unsubscribe: () => void } | undefined;
      let cancelled = false;

      getToken()
        .then((token) => {
          if (cancelled) return;
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : '',
            },
          }));
          innerSub = forward(operation).subscribe(observer);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error('[Apollo Auth] Failed to get token:', error);
          observer.error(error);
        });

      return () => {
        cancelled = true;
        innerSub?.unsubscribe();
      };
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
      // Returns cached data immediately then re-fetches in background —
      // screens feel instant on re-visit while still staying fresh.
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      // cache-first: avoids a network round-trip when the data is already
      // in the InMemoryCache. Only hits the network on a cache miss.
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

import {
  HttpLink,
  ApolloLink,
  ApolloClient,
  InMemoryCache,
  Observable,
  type FetchResult,
} from '@apollo/client'

export const createApolloClient = (getToken: () => Promise<string | null>) => {
  const errorLink = new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          // Handle GraphQL errors
          if (result.errors) {
            result.errors.forEach((error) => {
              const { message, locations, path, extensions } = error
              console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
              )

              // Handle rate limit errors separately
              if (
                extensions?.code === 'RATE_LIMIT_EXCEEDED' ||
                extensions?.statusCode === 429 ||
                message.includes('Too Many Requests')
              ) {
                console.warn(
                  '[GraphQL error]: Rate limit exceeded - too many requests'
                )
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('apollo-rate-limit-error', {
                      detail: { message, operation },
                    })
                  )
                }
              }

              // Handle authentication errors
              if (extensions?.code === 'UNAUTHENTICATED') {
                if (typeof window !== 'undefined') {
                  window.location.href =
                    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
                    '/auth/clinic/sign-in'
                }
              }
            })
          }
          observer.next(result)
        },
        error: (networkError) => {
          console.error(`[Network error]: ${networkError}`)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('apollo-network-error'))
          }
          observer.error(networkError)
        },
        complete: () => {
          observer.complete()
        },
      })
      return subscription
    })
  })

  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

  if (!graphqlEndpoint) {
    throw new Error(
      'NEXT_PUBLIC_GRAPHQL_ENDPOINT is not set. Configure it in your environment (Fly secrets or .env).'
    )
  }

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
    credentials: 'include',
    headers: {
      'apollo-require-preflight': 'true',
    },
  })

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
          }))
          const subscription = forward(operation).subscribe(observer)
          return subscription
        })
        .catch((error) => {
          observer.error(error)
        })
    })
  })

  return new ApolloClient({
    link: ApolloLink.from([authLink, errorLink, httpLink]),
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
  })
}

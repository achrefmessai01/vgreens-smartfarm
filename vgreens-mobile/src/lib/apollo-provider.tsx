import { useAuth } from '@clerk/clerk-expo';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { type ApolloClient, type NormalizedCacheObject } from '@apollo/client';
import { useEffect, useState, type ReactNode } from 'react';
import { createApolloClient } from './apollo-client';

export function ApolloProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [client, setClient] =
    useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    const apolloClient = createApolloClient(getToken);
    setClient(apolloClient);
  }, [getToken]);

  if (!client) return null;

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

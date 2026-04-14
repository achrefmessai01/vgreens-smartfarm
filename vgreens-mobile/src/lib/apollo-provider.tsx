import { useAuth } from '@clerk/clerk-expo';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { type ApolloClient, type NormalizedCacheObject } from '@apollo/client';
import { useMemo, useRef, type ReactNode } from 'react';
import { createApolloClient } from './apollo-client';

export function ApolloProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const client = useMemo<ApolloClient<NormalizedCacheObject>>(
    () => createApolloClient(() => getTokenRef.current()),
    [],
  );

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

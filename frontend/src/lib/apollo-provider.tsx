'use client';

import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createApolloClient } from './apollo-client';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { AuthCacheReset } from './auth-cache-reset';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, getToken } = useAuth();

  // Build the client once Clerk has hydrated, and only once. The authLink
  // calls getToken() per-request, so we don't need to rebuild the client
  // when Clerk swaps the getToken reference — doing so would orphan any
  // in-flight queries (their subscriptions live on the old client's
  // QueryManager) and leave consumers stuck on `loading: true`.
  const client = useMemo(
    () => (isLoaded ? createApolloClient(getToken) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoaded],
  );

  if (!client) return <PageSkeleton />;

  return (
    <BaseApolloProvider client={client}>
      <AuthCacheReset />
      {children}
    </BaseApolloProvider>
  );
}

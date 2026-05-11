'use client';

import { useApolloClient } from '@apollo/client/react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Shared logout entry point. Clears the Apollo cache BEFORE signing out so
 * the next user who lands on the same browser tab can't briefly see the
 * previous user's data through `cache-first` reads of the `me` query.
 */
export function useLogout() {
  const apolloClient = useApolloClient();
  const { signOut } = useClerk();
  const router = useRouter();

  return useCallback(async () => {
    try {
      await apolloClient.clearStore();
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [apolloClient, signOut, router]);
}

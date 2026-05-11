'use client';

import { useApolloClient } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

/**
 * Belt-and-braces guard against cross-user data leaks in the Apollo cache.
 *
 * The explicit logout path (`useLogout`) already clears the cache, but it
 * only fires when the user clicks logout in our UI. This watcher catches
 * every other way Clerk's session can change underfoot — hosted-account
 * sign-out, SSO account switch, token revocation, session expiry — by
 * comparing the current Clerk userId against the previous one and
 * clearing the store on any transition.
 */
export function AuthCacheReset() {
  const apolloClient = useApolloClient();
  const { userId } = useAuth();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const current = userId ?? null;
    if (previousUserId.current === undefined) {
      previousUserId.current = current;
      return;
    }
    if (previousUserId.current !== current) {
      previousUserId.current = current;
      apolloClient.clearStore();
    }
  }, [apolloClient, userId]);

  return null;
}

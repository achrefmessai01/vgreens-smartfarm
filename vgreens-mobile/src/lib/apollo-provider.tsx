import { useAuth } from '@clerk/clerk-expo';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { type ApolloClient, type NormalizedCacheObject } from '@apollo/client';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { createApolloClient } from './apollo-client';

// Clerk JWTs are valid for ~60 seconds. Refresh slightly earlier so we never
// ship an about-to-expire token.
const TOKEN_TTL_MS = 50_000;

interface TokenCache {
  token: string | null;
  expiresAt: number;
  pending?: Promise<string | null>;
}

export function ApolloProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // In-memory token cache with in-flight deduplication.
  //
  // Why this matters on mobile specifically: Clerk Expo's getToken() reads
  // from expo-secure-store on every call (slow on Android, ~50–200ms) and may
  // round-trip to Clerk's API to refresh the session JWT. Without this cache,
  // the cold-start burst of parallel queries (useMeQuery, useHarvestsQuery,
  // useAlertsQuery, useGetBucketDataQuery, …) each pay that cost
  // independently and serialise dashboard load to ~30–60s.
  //
  // With this cache:
  //   - The first concurrent burst shares a single in-flight token promise.
  //   - Subsequent operations reuse the cached JWT for up to TOKEN_TTL_MS.
  //   - After expiry, the next call fetches once and re-shares the promise.
  const cacheRef = useRef<TokenCache>({ token: null, expiresAt: 0 });

  const client = useMemo<{
    client: ApolloClient<NormalizedCacheObject>;
    prime: () => Promise<string | null>;
  }>(() => {
    const cachedGetToken = (): Promise<string | null> => {
      const cache = cacheRef.current;
      const now = Date.now();
      if (cache.token && cache.expiresAt > now) {
        return Promise.resolve(cache.token);
      }
      if (cache.pending) {
        return cache.pending;
      }
      cache.pending = (async () => {
        try {
          const token = (await getTokenRef.current()) ?? null;
          cache.token = token;
          cache.expiresAt = Date.now() + TOKEN_TTL_MS;
          return token;
        } catch (error) {
          console.error('[Apollo Auth] getToken failed:', error);
          // Don't poison the cache on failure — let the next call retry.
          cache.token = null;
          cache.expiresAt = 0;
          return null;
        } finally {
          cache.pending = undefined;
        }
      })();
      return cache.pending;
    };

    return { client: createApolloClient(cachedGetToken), prime: cachedGetToken };
  }, []);

  // Pre-warm the token cache the moment we know the user is signed in, so the
  // first GraphQL operation doesn't pay the SecureStore + Clerk-API cost in
  // its critical path. The result is cached and shared with all subsequent
  // queries via the in-flight dedup logic above.
  useEffect(() => {
    if (isSignedIn) {
      void client.prime();
    }
  }, [isSignedIn, client]);

  return (
    <BaseApolloProvider client={client.client}>{children}</BaseApolloProvider>
  );
}

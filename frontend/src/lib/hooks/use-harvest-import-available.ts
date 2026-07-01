'use client';

import * as React from 'react';
import { useAuth } from '@clerk/nextjs';
import { useCurrentUser } from './use-current-user';

function getBackendBase(): string {
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:8080/graphql';
  return endpoint.replace(/\/graphql\/?$/, '').replace(/\/+$/, '');
}

/**
 * Asks the backend whether the current tenant has a harvest import mapper
 * configured. Returns:
 *   null    — still loading
 *   true    — import is available (tenant has a mapper)
 *   false   — import not available (no mapper, or insufficient role)
 *
 * TENANT_ADMIN: the backend checks their own tenantId against the mapper registry.
 * VGREENS_ADMIN: always true (they pick the tenant in the import dialog).
 * TENANT_USER: always false (not an admin, button should not appear).
 */
export function useHarvestImportAvailable(): boolean | null {
  const { getToken, isSignedIn } = useAuth();
  const { isVGreensAdmin, isTenantAdmin, loading: userLoading } = useCurrentUser();
  const [available, setAvailable] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Not an admin role — no need to call the backend.
    if (userLoading) return;
    if (!isSignedIn || (!isVGreensAdmin && !isTenantAdmin)) {
      setAvailable(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) setAvailable(false);
          return;
        }

        const res = await fetch(
          `${getBackendBase()}/harvests/import/available`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (cancelled) return;

        if (!res.ok) {
          setAvailable(false);
          return;
        }

        const data = (await res.json()) as { available: boolean };
        setAvailable(data.available === true);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, isVGreensAdmin, isTenantAdmin, userLoading]);

  return available;
}

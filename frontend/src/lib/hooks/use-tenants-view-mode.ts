'use client';

import * as React from 'react';

export type TenantsViewMode = 'list' | 'grid';

const STORAGE_KEY = 'vgreens.tenants.view-mode';
const DEFAULT_MODE: TenantsViewMode = 'list';

function readStoredMode(): TenantsViewMode {
  // Guard for SSR — `localStorage` isn't defined on the server.
  if (typeof window === 'undefined') return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'list' || raw === 'grid') return raw;
  } catch {
    // localStorage disabled (private mode, quota, etc.) — fall through to
    // the default so the UI still works, we just don't persist.
  }
  return DEFAULT_MODE;
}

/**
 * Persist the tenant table's view preference (`list` | `grid`) to
 * localStorage so the admin's choice survives navigations and reloads.
 *
 * The hook starts with `DEFAULT_MODE` on the first render (both server-
 * and client-side) to avoid an SSR/CSR mismatch, then reconciles to the
 * stored value in a mount-time effect. That gives us the correct final
 * state without hydration warnings.
 */
export function useTenantsViewMode() {
  const [viewMode, setViewModeState] =
    React.useState<TenantsViewMode>(DEFAULT_MODE);

  // Reconcile to the persisted value once we're on the client. Running this
  // in an effect (not `useState`'s lazy initializer) keeps the initial
  // render identical between server and client.
  React.useEffect(() => {
    setViewModeState(readStoredMode());
  }, []);

  const setViewMode = React.useCallback((next: TenantsViewMode) => {
    setViewModeState(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures — the in-memory state is still updated.
    }
  }, []);

  return { viewMode, setViewMode };
}

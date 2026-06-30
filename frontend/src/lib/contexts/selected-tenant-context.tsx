'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Global "which tenant is the user viewing right now?" context.
 *
 * Only VGREENS_ADMIN ever changes the value through the UI (via the tenant
 * selector in the navbar). For tenant users / tenant admins the value stays
 * null and every consumer hook falls back to the user's own tenant on the
 * backend. We still expose the same context to non-admins so component code
 * doesn't have to branch on role.
 *
 * The selection is persisted in two places:
 *  - the URL `?tenantId=…` query param, so the page can be deep-linked /
 *    refreshed without losing context (and the browser back/forward buttons
 *    work for free)
 *  - `localStorage` under the LOCAL_STORAGE_KEY below, so when the admin
 *    navigates to a page that does not yet carry the param in its href, the
 *    last-chosen tenant sticks rather than silently snapping back to "all
 *    tenants".
 *
 * URL wins on first read so a paste-in link always reflects the destination.
 */
const LOCAL_STORAGE_KEY = 'vgreens.selectedTenantId';
const URL_PARAM = 'tenantId';

interface SelectedTenantContextValue {
  /**
   * `null` means "no tenant scoped" — for admins this surfaces as the
   * cross-tenant view; for other users it just means "use my own tenant".
   * Consumer hooks should forward `selectedTenantId ?? undefined` into Apollo
   * variables so GraphQL drops the variable rather than sending an empty
   * string.
   */
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
}

const SelectedTenantContext =
  React.createContext<SelectedTenantContextValue | null>(null);

/** Reads the persisted tenant id (if any). SSR-safe — returns null on the server. */
function readPersisted(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePersisted(value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(LOCAL_STORAGE_KEY, value);
    else window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Persistence is a nice-to-have; never crash the app over storage errors.
  }
}

/**
 * Pushes the current selection into the URL without a navigation. We use
 * `replaceState` (rather than `router.replace`) to avoid triggering a server
 * re-render on every selection — the value lives entirely in the URL +
 * context, and the consuming hooks pick it up reactively.
 */
function syncToUrl(value: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(URL_PARAM, value);
  else url.searchParams.delete(URL_PARAM);
  window.history.replaceState({}, '', url.toString());
}

export function SelectedTenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const urlTenantId = searchParams.get(URL_PARAM);

  // SSR-safe lazy initializer: prefer URL on first paint, fall back to the
  // persisted value so a navigation between pages that don't carry the param
  // doesn't drop the admin back to "all tenants".
  const [selectedTenantId, setSelectedTenantIdState] = React.useState<
    string | null
  >(() => urlTenantId ?? readPersisted());

  // Keep state in sync when the URL changes via the browser back button or a
  // sibling tenant-selector instance somewhere else in the tree.
  React.useEffect(() => {
    if (urlTenantId !== null && urlTenantId !== selectedTenantId) {
      setSelectedTenantIdState(urlTenantId);
    }
    // Intentionally only depends on urlTenantId — we don't want state changes
    // we just made to re-trigger this effect and clobber themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTenantId]);

  const setSelectedTenantId = React.useCallback((tenantId: string | null) => {
    setSelectedTenantIdState(tenantId);
    writePersisted(tenantId);
    syncToUrl(tenantId);
  }, []);

  const value = React.useMemo<SelectedTenantContextValue>(
    () => ({ selectedTenantId, setSelectedTenantId }),
    [selectedTenantId, setSelectedTenantId],
  );

  return (
    <SelectedTenantContext.Provider value={value}>
      {children}
    </SelectedTenantContext.Provider>
  );
}

/**
 * Read the currently-selected tenant id. Returns `null` if the provider has
 * not been mounted (e.g. on public/login pages) so callers can degrade
 * gracefully — they'll fall back to the backend's interceptor-derived scope.
 */
export function useSelectedTenantId(): string | null {
  const ctx = React.useContext(SelectedTenantContext);
  return ctx?.selectedTenantId ?? null;
}

/**
 * Imperative setter — paired with `useSelectedTenantId` for the actual
 * selector UI. Throws when used outside the provider so we catch wiring
 * mistakes early.
 */
export function useSetSelectedTenantId(): (
  tenantId: string | null,
) => void {
  const ctx = React.useContext(SelectedTenantContext);
  if (!ctx) {
    throw new Error(
      'useSetSelectedTenantId must be used within a SelectedTenantProvider',
    );
  }
  return ctx.setSelectedTenantId;
}

/**
 * Convenience for Apollo `variables`: returns the selection in the shape
 * GraphQL expects — `undefined` rather than `null` or `''` so the variable
 * is omitted from the operation rather than sent as null.
 */
export function useTenantIdVariable(): string | undefined {
  const selected = useSelectedTenantId();
  return selected ?? undefined;
}

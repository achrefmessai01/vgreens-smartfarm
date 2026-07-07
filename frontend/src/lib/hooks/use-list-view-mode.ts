'use client';

import * as React from 'react';

export type ListViewMode = 'list' | 'grid';

interface UseListViewModeOptions {
  /** Localstorage key. Namespace per-surface, e.g. `vgreens.users.view-mode`. */
  storageKey: string;
  /** Fallback mode used before hydration + when localStorage is unavailable. */
  defaultMode?: ListViewMode;
}

/**
 * Generic list ↔ grid view-mode hook backed by localStorage. Consolidates
 * the persistence + SSR-safety logic that used to live in the per-surface
 * hooks (tenants, users, features) so new admin tables can drop it in
 * without reinventing the wheel.
 *
 * Starts with `defaultMode` on both the server and the first client
 * render, then reconciles to the stored value in a mount-time effect —
 * this avoids the hydration-mismatch warning React would otherwise raise
 * if we read localStorage synchronously in `useState`'s initializer.
 */
export function useListViewMode({
  storageKey,
  defaultMode = 'list',
}: UseListViewModeOptions) {
  const [viewMode, setViewModeState] =
    React.useState<ListViewMode>(defaultMode);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === 'list' || raw === 'grid') setViewModeState(raw);
    } catch {
      // localStorage unavailable (private mode, quota, disabled) — keep
      // the current in-memory value so the UI still works.
    }
  }, [storageKey]);

  const setViewMode = React.useCallback(
    (next: ListViewMode) => {
      setViewModeState(next);
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Ignore write failures — in-memory state is still updated.
      }
    },
    [storageKey],
  );

  return { viewMode, setViewMode };
}

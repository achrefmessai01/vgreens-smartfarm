'use client';

import { useListViewMode } from '@/lib/hooks/use-list-view-mode';

/**
 * Feature-flags surface view-mode preference. Delegates to the generic
 * `useListViewMode` under a feature-flags-scoped localStorage key so the
 * admin's list ↔ grid choice survives navigations and reloads without
 * clashing with the tenants / users preferences.
 */
export function useFeaturesViewMode() {
  return useListViewMode({
    storageKey: 'vgreens.features.view-mode',
    defaultMode: 'list',
  });
}

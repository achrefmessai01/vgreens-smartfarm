'use client';

import { useI18n } from '@/i18n';
import type { NavGroup } from '@/lib/hooks/use-tenant-nav-items';
import {
  Building2,
  ClipboardList,
  Flag,
  Settings,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import * as React from 'react';

/**
 * Shape of an admin sidebar nav item. Structurally aligned with
 * `TenantNavItem` so both feed the same `SidebarContent` prop type.
 */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: NavGroup;
}

/**
 * Admin sidebar nav items, grouped under OVERVIEW / MANAGEMENT / SYSTEM
 * headers. Memoized on the translation object so re-renders don't rebuild the
 * array on every parent tick.
 *
 * Kept in a hook (rather than a static const) so the labels react to the
 * user's active locale.
 */
export function useAdminNavItems(): AdminNavItem[] {
  const { t } = useI18n();
  return React.useMemo(
    () => [
      // Tenants sits at the top of MANAGEMENT — it's the primary admin
      // workflow, and grouping it alongside Users + Feature Flags makes the
      // "tenant-scoped controls" section read as a single unit.
      {
        label: t.navigation.tenants,
        href: '/admin/tenants',
        icon: Building2,
        group: 'management',
      },
      {
        label: t.navigation.adminUsers,
        href: '/admin/users',
        icon: Users,
        group: 'management',
      },
      {
        label: t.navigation.featureFlags,
        href: '/admin/feature-flags',
        icon: Flag,
        group: 'management',
      },
      {
        label: t.navigation.reports,
        href: '/admin/reports',
        icon: ClipboardList,
        group: 'overview',
      },
      {
        label: t.navigation.systemErrors,
        href: '/admin/system-errors',
        icon: Zap,
        group: 'system',
      },
      {
        label: t.navigation.adminHistory ?? 'History',
        href: '/admin/history',
        icon: Trash2,
        group: 'system',
      },
      {
        label: t.navigation.settings,
        href: '/admin/settings',
        icon: Settings,
        group: 'system',
      },
    ],
    [t],
  );
}

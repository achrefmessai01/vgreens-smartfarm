'use client';

import { UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import {
  AlertTriangle,
  Apple,
  Clock,
  Cpu,
  Sprout,
  Users,
  Video,
} from 'lucide-react';
import * as React from 'react';

/**
 * Which sidebar section a nav item belongs to. The redesigned sidebar renders
 * items grouped by these buckets with an uppercase section header above each
 * group; the in-header `TenantNavbar` ignores the field and renders a flat
 * list.
 */
export type NavGroup =
  | 'overview'
  | 'management'
  | 'system'
  | 'farm'
  | 'monitoring';

/**
 * Shape of a sidebar / header nav item. Mirrors the sidebar's local NavItem so
 * the sidebar can keep accepting these without a type change.
 */
export interface TenantNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Feature flag gate. Admins bypass this. */
  featureKey?: string;
  /** When set, only users whose role is in this list can see the item. */
  allowedRoles?: UserRole[];
  /** Which sidebar section this item lives in. Optional so consumers that
   *  render a flat list (like the in-header nav) can ignore it. */
  group?: NavGroup;
}

/**
 * Returns the filtered tenant nav items for the current user. Single source of
 * truth shared between the desktop sidebar and the in-header TenantNavbar so
 * both stay in lock-step when items are added or gated differently.
 *
 * Gates:
 *  - Role gate (allowedRoles) — runs first; admins can see every item, but
 *    plain tenant users only see what their role is explicitly allowed to.
 *  - Feature gate (featureKey) — tenant users see only items their tenant has
 *    enabled. Admins bypass this *unless* a `tenantIdOverride` is passed,
 *    which signals "I am previewing this specific tenant" — in that case we
 *    enforce that tenant's feature flags too, so the admin sees exactly what
 *    a user of that tenant would.
 *
 * @param tenantIdOverride scope the feature lookup to a specific tenant id
 *   (used by the in-header `TenantNavbar` when an admin has picked a tenant
 *   in the navbar selector). When omitted the current user's tenant is used.
 */
export function useTenantNavItems(
  tenantIdOverride?: string,
): TenantNavItem[] {
  const { t } = useI18n();
  const { role, isVGreensInternal, user } = useCurrentUser();
  const { hasFeature } = useTenantFeatures(tenantIdOverride);
  const isViewingSpecificTenant = Boolean(tenantIdOverride);
  // Device status is vGreens-internal by default; a tenant's TENANT_ADMINs
  // only get the item when the tenant is opted in via settings (toggled by a
  // vGreens admin on the tenant's features tab).
  const deviceStatusForTenantAdmins =
    user?.tenant?.settings?.deviceStatusForTenantAdmins ?? false;

  const allItems: TenantNavItem[] = [
    {
      label: t.navigation.farmOverview,
      href: '/tenant/farm-overview',
      icon: Sprout,
      featureKey: 'farm_overview',
      group: 'farm',
    },
    {
      label: t.navigation.harvest || 'Harvest',
      href: '/tenant/harvest',
      icon: Apple,
      group: 'farm',
    },
    {
      label: t.navigation.history,
      href: '/tenant/history',
      icon: Clock,
      featureKey: 'data_analytics',
      group: 'farm',
    },
    {
      label: t.navigation.alerts,
      href: '/tenant/alerts',
      icon: AlertTriangle,
      featureKey: 'sensor_alerts',
      group: 'monitoring',
    },
    {
      label: t.navigation.cameraLivestream,
      href: '/tenant/camera-livestream',
      icon: Video,
      featureKey: 'camera_livestream',
      group: 'monitoring',
    },
    {
      label: t.navigation.deviceStatus,
      href: '/tenant/devices',
      icon: Cpu,
      featureKey: 'device_status',
      allowedRoles: deviceStatusForTenantAdmins
        ? [UserRole.VgreensAdmin, UserRole.TenantAdmin]
        : [UserRole.VgreensAdmin],
      group: 'monitoring',
    },
    {
      label: t.navigation.users,
      href: '/tenant/users',
      icon: Users,
      featureKey: 'user_management',
      allowedRoles: [
        UserRole.VgreensAdmin,
        UserRole.VgreensMember,
        UserRole.TenantAdmin,
      ],
      group: 'management',
    },
  ];

  return allItems.filter((item) => {
    if (item.allowedRoles && role && !item.allowedRoles.includes(role)) {
      return false;
    }
    if (!item.featureKey) return true;
    // Internal vGreens users (admin + view-only member) normally see every
    // item, but when previewing a specific tenant we honour that tenant's
    // feature flags so the header nav mirrors what a user of that tenant
    // would actually see.
    if (isVGreensInternal && !isViewingSpecificTenant) return true;
    return hasFeature(item.featureKey);
  });
}

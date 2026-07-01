import { UserRole } from '@/generated/graphql';
import type { Translations } from '@/i18n/translations';
import {
  AlertTriangle,
  Apple,
  Building2,
  Clock,
  ClipboardList,
  Flag,
  Settings,
  Sprout,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import * as React from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  featureKey?: string; // Optional feature key to check if item should be shown
}

// Get admin navigation items with translations
export const getAdminNavItems = (t: Translations): NavItem[] => [
  {
    label: t.navigation.tenants,
    href: '/admin/tenants',
    icon: Building2,
  },
  {
    label: t.navigation.adminUsers,
    href: '/admin/users',
    icon: Users,
  },
  {
    label: t.navigation.featureFlags,
    href: '/admin/feature-flags',
    icon: Flag,
  },
  {
    label: t.navigation.reports,
    href: '/admin/reports',
    icon: ClipboardList,
  },
  {
    label: t.navigation.systemErrors,
    href: '/admin/system-errors',
    icon: Zap,
  },
  {
    label: t.navigation.settings,
    href: '/admin/settings',
    icon: Settings,
  },
];

// Get tenant navigation items with translations
export const getTenantNavItems = (t: Translations): NavItem[] => [
  {
    label: t.navigation.farmOverview,
    href: '/tenant/farm-overview',
    icon: Sprout,
    featureKey: 'farm_overview', // Always show farm overview
  },
  {
    label: t.navigation.harvest || 'Harvest',
    href: '/tenant/harvest',
    icon: Apple,
    // Always show harvest - no feature key required
  },
  {
    label: t.navigation.users,
    href: '/tenant/users',
    icon: Users,
    featureKey: 'user_management', // Always show user management
  },
  {
    label: t.navigation.alerts,
    href: '/tenant/alerts',
    icon: AlertTriangle,
    featureKey: 'sensor_alerts',
  },
  {
    label: t.navigation.cameraLivestream,
    href: '/tenant/camera-livestream',
    icon: Video,
    featureKey: 'camera_livestream',
  },
  {
    label: t.navigation.history,
    href: '/tenant/history',
    icon: Clock,
    featureKey: 'data_analytics',
  },
];

// Filter navigation items based on enabled features. `isVGreensInternal`
// covers both VGREENS_ADMIN and its view-only sibling VGREENS_MEMBER —
// both bypass the feature-flag gate.
export const filterTenantNavItems = (
  allItems: NavItem[],
  hasFeature: (key: string) => boolean,
  isVGreensInternal: boolean,
): NavItem[] => {
  return allItems.filter((item) => {
    // Always show items without featureKey or if feature is enabled
    if (!item.featureKey) return true;
    // Internal vGreens users see every item
    if (isVGreensInternal) return true;
    // For tenant users, check if feature is enabled
    return hasFeature(item.featureKey);
  });
};

// Get navigation items based on user role. Internal vGreens roles
// (VGREENS_ADMIN + VGREENS_MEMBER) share the admin nav; they navigate into
// tenant pages via the in-header TenantNavbar once a tenant is picked.
export const getNavigationItems = (
  role: UserRole | undefined,
  t: Translations,
  hasFeature: (key: string) => boolean,
): NavItem[] => {
  const isVGreensInternal =
    role === UserRole.VgreensAdmin || role === UserRole.VgreensMember;

  if (isVGreensInternal) {
    return getAdminNavItems(t);
  }

  const allTenantItems = getTenantNavItems(t);
  return filterTenantNavItems(allTenantItems, hasFeature, isVGreensInternal);
};

import { UserRole } from '@/generated/graphql'
import {
  AlertTriangle,
  Apple,
  Bell,
  Building2,
  Clock,
  ClipboardList,
  Flag,
  LayoutDashboard,
  Settings,
  Sprout,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import * as React from 'react'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  featureKey?: string // Optional feature key to check if item should be shown
}

// Admin navigation items
export const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Tenants',
    href: '/admin/tenants',
    icon: Building2,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Feature Flags',
    href: '/admin/feature-flags',
    icon: Flag,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: ClipboardList,
  },
  {
    label: 'System Errors',
    href: '/admin/system-errors',
    icon: Zap,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

// Get tenant navigation items with translations
export const getTenantNavItems = (t: any): NavItem[] => [
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
    label: t.navigation.warnings,
    href: '/tenant/warnings',
    icon: Bell,
    featureKey: 'sensor_alerts',
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
]

// Filter navigation items based on enabled features
export const filterTenantNavItems = (
  allItems: NavItem[],
  hasFeature: (key: string) => boolean,
  isVGreensAdmin: boolean
): NavItem[] => {
  return allItems.filter((item) => {
    // Always show items without featureKey or if feature is enabled
    if (!item.featureKey) return true
    // For admin users, show all items
    if (isVGreensAdmin) return true
    // For tenant users, check if feature is enabled
    return hasFeature(item.featureKey)
  })
}

// Get navigation items based on user role
export const getNavigationItems = (
  role: UserRole | undefined,
  t: any,
  hasFeature: (key: string) => boolean
): NavItem[] => {
  const isVGreensAdmin = role === UserRole.VgreensAdmin
  
  if (isVGreensAdmin) {
    return adminNavItems
  }
  
  const allTenantItems = getTenantNavItems(t)
  return filterTenantNavItems(allTenantItems, hasFeature, isVGreensAdmin)
}
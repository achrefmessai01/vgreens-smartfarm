'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarSkeleton } from '@/components/ui/sidebar-skeleton';
import { User, UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLogout } from '@/lib/hooks/use-logout';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Apple,
  Building2,
  ClipboardList,
  Clock,
  Cpu,
  Flag,
  Menu,
  Settings,
  Sprout,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { SidebarContent } from './sidebar-content';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  featureKey?: string; // Optional feature key to check if item should be shown
  /**
   * Optional list of allowed roles. When set, the nav item is only rendered
   * if the current user's role is in this list. Used to hide pages like
   * "User management" from regular tenant users.
   */
  allowedRoles?: UserRole[];
}

interface SidebarProps {
  user?: User | null;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({
  user: propUser,
  onLogout,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const logout = useLogout();
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Always fetch current user to confirm role
  const { user: currentUser, role, loading: userLoading } = useCurrentUser();
  const { hasFeature, loading: featuresLoading } = useTenantFeatures();

  const handleLogout = React.useCallback(async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  }, [logout, onLogout]);

  // Use current user if available, otherwise fall back to prop
  const user = currentUser || propUser;
  const isVGreensAdmin = role === UserRole.VgreensAdmin;

  // Use external state if provided, otherwise use internal state
  const isCollapsed =
    externalIsCollapsed !== undefined
      ? externalIsCollapsed
      : internalIsCollapsed;

  React.useEffect(() => {
    // Only manage localStorage if we're using internal state
    if (externalIsCollapsed === undefined) {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setInternalIsCollapsed(JSON.parse(saved));
      }
    }
  }, [externalIsCollapsed]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    if (externalOnToggleCollapse) {
      externalOnToggleCollapse(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    } else {
      setInternalIsCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    }
  };

  // Admin navigation items
  const adminNavItems: NavItem[] = [
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

  // Tenant navigation items - filtered by enabled features
  const allTenantNavItems: NavItem[] = [
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
      featureKey: 'user_management',
      // Regular tenant users shouldn't be able to manage other users.
      allowedRoles: [UserRole.VgreensAdmin, UserRole.TenantAdmin],
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
    {
      label: t.navigation.deviceStatus,
      href: '/tenant/devices',
      icon: Cpu,
      featureKey: 'device_status',
      // Device fleet health is an admin concern, not for plain tenant users.
      allowedRoles: [UserRole.VgreensAdmin, UserRole.TenantAdmin],
    },
  ];

  // Filter navigation items based on enabled features and allowed roles.
  const tenantNavItems: NavItem[] = allTenantNavItems.filter((item) => {
    // Role gate runs first — admins can see everything but tenant users only
    // see items their role is explicitly allowed to access.
    if (item.allowedRoles && role && !item.allowedRoles.includes(role)) {
      return false;
    }
    if (!item.featureKey) return true;
    if (isVGreensAdmin) return true;
    return hasFeature(item.featureKey);
  });

  // Select nav items based on role
  const navItems = isVGreensAdmin ? adminNavItems : tenantNavItems;

  const defaultUser = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName}`
      : t.common.unknownUser,
    role: user?.role || (isVGreensAdmin ? 'VGREENS_ADMIN' : 'TENANT_USER'),
    avatar: user?.imageUrl || '',
  };

  // Show loading state while fetching user or features
  if (userLoading || (!isVGreensAdmin && featuresLoading)) {
    return <SidebarSkeleton />;
  }

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">{t.common.navigationMenu}</SheetTitle>
          <SidebarContent
            mobile
            isCollapsed={false}
            pathname={pathname}
            navItems={navItems}
            defaultUser={defaultUser}
            t={t}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
            onToggleCollapse={toggleCollapse}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'dark:border-sidebar-border/70 fixed top-0 left-0 z-40 hidden h-screen flex-col border-r transition-all duration-300 lg:flex',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          pathname={pathname}
          navItems={navItems}
          defaultUser={defaultUser}
          t={t}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </aside>
    </>
  );
}

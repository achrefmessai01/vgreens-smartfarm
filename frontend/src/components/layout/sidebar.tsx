'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarSkeleton } from '@/components/ui/sidebar-skeleton';
import { UserRole } from '@/generated/graphql';
import type { UserData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLogout } from '@/lib/hooks/use-logout';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { useTenantNavItems } from '@/lib/hooks/use-tenant-nav-items';
import { cn } from '@/lib/utils';
import {
  Building2,
  ClipboardList,
  Flag,
  Menu,
  Settings,
  Users,
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
  user?: UserData | null;
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
  const {
    user: currentUser,
    role,
    isVGreensInternal,
    loading: userLoading,
  } = useCurrentUser();
  // Tenant features are still consulted by `useTenantNavItems` below; we only
  // need the loading flag here to gate the sidebar skeleton.
  const { loading: featuresLoading } = useTenantFeatures();
  // Filtered tenant nav items (role + feature gates applied). Shared with the
  // in-header `TenantNavbar` so both render the same set in lock-step. Only
  // surfaces in the sidebar for non-admin users; VGREENS_ADMIN keeps the
  // admin nav and uses the header `TenantNavbar` to jump into tenant pages.
  const tenantNavItems = useTenantNavItems();

  const handleLogout = React.useCallback(async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  }, [logout, onLogout]);

  // Use current user if available, otherwise fall back to prop
  const user = currentUser || propUser;
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  // VGREENS_MEMBER shares every navigation surface with VGREENS_ADMIN; we key
  // most of the layout decisions off `isVGreensInternal` from here on down.

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

  // Tenant nav items now come from `useTenantNavItems` (above) — single source
  // of truth shared with the in-header `TenantNavbar`.

  // Select nav items based on role:
  // - Internal vGreens users (VGREENS_ADMIN + VGREENS_MEMBER) always see the
  //   admin nav in the sidebar, so they never lose access to /admin/tenants,
  //   /admin/users, etc., even after picking a tenant. The in-header
  //   `TenantNavbar` provides the tenant-page links when a tenant is selected.
  // - Everyone else sees the filtered tenant nav.
  const navItems = isVGreensInternal ? adminNavItems : tenantNavItems;

  const defaultUser = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName}`
      : t.common.unknownUser,
    role: user?.role || (isVGreensAdmin ? 'VGREENS_ADMIN' : 'TENANT_USER'),
    avatar: user?.imageUrl || '',
  };

  // Show loading state while fetching user or features. Internal users don't
  // depend on tenant feature flags for their nav (they get the admin nav),
  // so we skip the features-loading gate for them.
  if (userLoading || (!isVGreensInternal && featuresLoading)) {
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

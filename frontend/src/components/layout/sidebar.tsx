'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarSkeleton } from '@/components/ui/sidebar-skeleton';
import { User, UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { cn } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';
import {
  AlertTriangle,
  Apple,
  Bell,
  Building2,
  ClipboardList,
  Clock,
  Flag,
  LayoutDashboard,
  Menu,
  Settings,
  Sprout,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { SidebarContent } from './sidebar-content';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  featureKey?: string; // Optional feature key to check if item should be shown
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
  const router = useRouter();
  const { signOut } = useClerk();
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Always fetch current user to confirm role
  const { user: currentUser, role, loading: userLoading } = useCurrentUser();
  const { hasFeature, loading: featuresLoading } = useTenantFeatures();

  // Handle logout
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
      router.push('/login');
      // Call custom onLogout if provided
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, router, onLogout]);

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
  ];

  // Filter navigation items based on enabled features
  const tenantNavItems: NavItem[] = allTenantNavItems.filter((item) => {
    // Always show items without featureKey or if feature is enabled
    if (!item.featureKey) return true;
    // For admin users, show all items
    if (isVGreensAdmin) return true;
    // For tenant users, check if feature is enabled
    return hasFeature(item.featureKey);
  });

  // Select nav items based on role
  const navItems = isVGreensAdmin ? adminNavItems : tenantNavItems;

  const defaultUser = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName}`
      : 'Unknown User',
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
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300 border-r dark:border-sidebar-border/70',
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

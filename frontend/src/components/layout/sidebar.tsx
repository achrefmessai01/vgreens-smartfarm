'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarSkeleton } from '@/components/ui/sidebar-skeleton';
import { User, UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { cn } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { SidebarContent } from './sidebar-content';
import { getNavigationItems } from './sidebar-navigation';

interface SidebarProps {
  user?: User | null;
  onLogout?: () => void;
}

export function Sidebar({ user: propUser, onLogout }: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
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

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Get navigation items based on user role and features
  const navItems = getNavigationItems(role, t, hasFeature);

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

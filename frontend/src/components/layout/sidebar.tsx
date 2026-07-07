'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarSkeleton } from '@/components/ui/sidebar-skeleton';
import type { UserData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { useAdminNavItems } from '@/lib/hooks/use-admin-nav-items';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLogout } from '@/lib/hooks/use-logout';
import { useSidebarCollapse } from '@/lib/hooks/use-sidebar-collapse';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { useTenantNavItems } from '@/lib/hooks/use-tenant-nav-items';
import { useUnresolvedSystemErrorsCount } from '@/lib/hooks/use-unresolved-system-errors-count';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { SidebarContent } from './sidebar-content';
import type { SidebarNavItem } from './sidebar-content';
import { getRoleLabel } from './sidebar/sidebar-role-label';

interface SidebarProps {
  user?: UserData | null;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

/**
 * Top-level sidebar container. Owns collapse state (with an optional
 * externally-controlled override), coordinates data hooks, and hands a
 * flattened `SidebarNavItem[]` down to the presentational `SidebarContent`.
 */
export function Sidebar({
  user: propUser,
  onLogout,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const logout = useLogout();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const {
    user: currentUser,
    role,
    isVGreensInternal,
    loading: userLoading,
  } = useCurrentUser();
  const { loading: featuresLoading } = useTenantFeatures();
  const tenantNavItems = useTenantNavItems();
  const adminNavItems = useAdminNavItems();
  const unresolvedErrors = useUnresolvedSystemErrorsCount();
  const { isCollapsed, toggleCollapse } = useSidebarCollapse({
    externalIsCollapsed,
    externalOnToggleCollapse,
  });

  const handleLogout = React.useCallback(async () => {
    await logout();
    if (onLogout) onLogout();
  }, [logout, onLogout]);

  // Fold admin vs tenant items into the single shape SidebarContent expects
  // and layer the live unresolved system-errors count onto the badge here so
  // the child stays presentation-only.
  const sidebarNavItems: SidebarNavItem[] = React.useMemo(() => {
    const source = isVGreensInternal ? adminNavItems : tenantNavItems;
    return source.map((item) => ({
      label: item.label,
      href: item.href,
      icon: item.icon,
      group: item.group,
      badge:
        item.href === '/admin/system-errors' ? unresolvedErrors : undefined,
    }));
  }, [adminNavItems, isVGreensInternal, tenantNavItems, unresolvedErrors]);

  const user = currentUser || propUser;
  const defaultUser = React.useMemo(
    () => ({
      name: user?.firstName
        ? `${user.firstName} ${user.lastName}`
        : t.common.unknownUser,
      roleLabel: getRoleLabel(role, t),
      avatar: user?.imageUrl || '',
    }),
    [user, role, t],
  );

  if (userLoading || (!isVGreensInternal && featuresLoading)) {
    return <SidebarSkeleton />;
  }

  const contentProps = {
    pathname,
    navItems: sidebarNavItems,
    showTenantCard: isVGreensInternal,
    defaultUser,
    theme,
    setTheme,
    onLogout: handleLogout,
    onToggleCollapse: toggleCollapse,
    onCloseMobile: () => setIsMobileOpen(false),
  } as const;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label={t.common.navigationMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">{t.common.navigationMenu}</SheetTitle>
          <SidebarContent mobile isCollapsed={false} {...contentProps} />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          'dark:border-sidebar-border/70 fixed top-0 left-0 z-40 hidden h-screen flex-col border-r transition-all duration-300 lg:flex',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} {...contentProps} />
      </aside>
    </>
  );
}

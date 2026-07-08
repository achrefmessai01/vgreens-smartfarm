'use client';

import { useI18n } from '@/i18n';
import * as React from 'react';
import { SidebarBrand } from './sidebar/sidebar-brand';
import { SidebarDarkModeRow } from './sidebar/sidebar-dark-mode-row';
import { SidebarNavGroup } from './sidebar/sidebar-nav-group';
import {
  bucketByGroup,
  getGroupLabels,
  GROUP_ORDER,
} from './sidebar/sidebar-nav-groups';
import type { SidebarNavItem } from './sidebar/sidebar-nav-groups';
import { SidebarSearch } from './sidebar/sidebar-search';
import { SidebarTenantCard } from './sidebar/sidebar-tenant-card';
import { SidebarUserCard } from './sidebar/sidebar-user-card';

// Re-export so `sidebar.tsx` can consume the type from one place.
export type { SidebarNavItem } from './sidebar/sidebar-nav-groups';

interface SidebarContentProps {
  mobile?: boolean;
  isCollapsed: boolean;
  pathname: string;
  navItems: SidebarNavItem[];
  /** True for internal vGreens users; controls whether the tenant card is
   *  rendered. */
  showTenantCard: boolean;
  defaultUser: { name: string; roleLabel: string; avatar?: string };
  theme: string | undefined;
  setTheme: (theme: string) => void;
  onLogout?: () => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

/**
 * Composes the sidebar UI from the small building blocks under `./sidebar/*`.
 * All data fetching happens in the parent `Sidebar`; this component stays
 * purely presentational to keep the file small and easy to reason about.
 */
export function SidebarContent({
  mobile = false,
  isCollapsed,
  pathname,
  navItems,
  showTenantCard,
  defaultUser,
  theme,
  setTheme,
  onLogout,
  onToggleCollapse,
  onCloseMobile,
}: SidebarContentProps) {
  const { t } = useI18n();
  const groupLabels = React.useMemo(() => getGroupLabels(t), [t]);
  const buckets = React.useMemo(() => bucketByGroup(navItems), [navItems]);
  const ungrouped = buckets.get('ungrouped') ?? [];
  const onNavigate = () => mobile && onCloseMobile();

  return (
    <div className="bg-muted/20 dark:bg-background text-foreground dark:text-sidebar-foreground flex h-full flex-col">
      <SidebarBrand
        isCollapsed={isCollapsed}
        mobile={mobile}
        onToggleCollapse={onToggleCollapse}
      />

      {showTenantCard && (
        <SidebarTenantCard isCollapsed={isCollapsed} mobile={mobile} />
      )}

      <SidebarSearch isCollapsed={isCollapsed} mobile={mobile} />

      {/* Divider between the pinned header block (brand/tenant/search) and
          the scroll region, matching the mockup's subtle rule. */}
      <div className="border-border/60 dark:border-sidebar-border/60 mx-4 mt-4 border-t" />

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-4">
        {ungrouped.length > 0 && (
          <SidebarNavGroup
            label=""
            items={ungrouped}
            pathname={pathname}
            isCollapsed={isCollapsed}
            mobile={mobile}
            onNavigate={onNavigate}
          />
        )}
        {GROUP_ORDER.map((group) => (
          <SidebarNavGroup
            key={group}
            label={groupLabels[group]}
            items={buckets.get(group) ?? []}
            pathname={pathname}
            isCollapsed={isCollapsed}
            mobile={mobile}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Divider between the scroll region and the pinned footer block
          (dark-mode row + user card). */}
      <div className="border-border/60 dark:border-sidebar-border/60 mx-4 border-t" />

      <SidebarDarkModeRow
        isCollapsed={isCollapsed}
        mobile={mobile}
        theme={theme}
        setTheme={setTheme}
      />

      <SidebarUserCard
        name={defaultUser.name}
        roleLabel={defaultUser.roleLabel}
        avatarUrl={defaultUser.avatar}
        isCollapsed={isCollapsed}
        mobile={mobile}
        onLogout={onLogout}
      />
    </div>
  );
}

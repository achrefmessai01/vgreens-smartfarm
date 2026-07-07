'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import * as React from 'react';

export interface SidebarNavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Optional numeric badge (e.g. unresolved system errors). */
  badge?: number | null;
}

interface SidebarNavItemProps {
  item: SidebarNavItemDef;
  isActive: boolean;
  isCollapsed: boolean;
  mobile: boolean;
  onNavigate: () => void;
}

/**
 * Single sidebar nav row. The active state paints a green vertical bar that
 * hugs the sidebar's outer left edge and darkens the row background with a
 * neutral muted tint (matching the mockup) so the active page reads at a
 * glance without leaning on the accent color inside the row itself.
 * Collapsed rows shrink to a centered icon and rely on the `title` attribute
 * for hover-labels.
 */
export function SidebarNavItem({
  item,
  isActive,
  isCollapsed,
  mobile,
  onNavigate,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const showLabel = !isCollapsed || mobile;
  const badgeValue = item.badge;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed && !mobile ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-foreground bg-foreground/5 dark:bg-white/5 dark:text-sidebar-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:text-sidebar-foreground/80 dark:hover:bg-sidebar-accent/60 dark:hover:text-sidebar-foreground',
        isCollapsed && !mobile && 'justify-center px-2',
      )}
    >
      {/* Left green bar for the active state. Offset by the nav's px-2 so the
          bar hugs the sidebar's outer left edge (per the mockup) rather than
          the row's own padding. */}
      {isActive && (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 -left-2 w-1 rounded-r bg-emerald-500"
        />
      )}
      <Icon className="h-4 w-4 shrink-0 text-current" />
      {showLabel && <span className="truncate">{item.label}</span>}
      {showLabel && typeof badgeValue === 'number' && badgeValue > 0 && (
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
            'bg-muted text-muted-foreground dark:bg-sidebar-accent/60',
          )}
        >
          {badgeValue > 99 ? '99+' : badgeValue}
        </span>
      )}
    </Link>
  );
}

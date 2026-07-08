'use client';

import { SidebarNavItem } from './sidebar-nav-item';
import type { SidebarNavItemDef } from './sidebar-nav-item';

interface SidebarNavGroupProps {
  /** Localized group header (already uppercased in copy). Empty string hides
   *  the header — used for the ungrouped fallback bucket. */
  label: string;
  items: SidebarNavItemDef[];
  pathname: string;
  isCollapsed: boolean;
  mobile: boolean;
  onNavigate: () => void;
}

/**
 * A titled group of sidebar nav items. Renders the section header as a small
 * uppercase label above the list. When the sidebar is collapsed we hide the
 * header entirely and just render the items so nothing overflows the rail.
 */
export function SidebarNavGroup({
  label,
  items,
  pathname,
  isCollapsed,
  mobile,
  onNavigate,
}: SidebarNavGroupProps) {
  if (items.length === 0) return null;

  const showHeader = (!isCollapsed || mobile) && label.length > 0;

  return (
    <div className="flex flex-col gap-1">
      {showHeader && (
        <div className="text-muted-foreground/80 dark:text-sidebar-foreground/60 px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
            mobile={mobile}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

import type { NavGroup } from '@/lib/hooks/use-tenant-nav-items';
import type { Translations } from '@/i18n/translations';
import type { SidebarNavItemDef } from './sidebar-nav-item';

/**
 * A nav item as it enters the sidebar composition layer — the visual shape
 * plus an optional group tag used for section bucketing.
 */
export interface SidebarNavItem extends SidebarNavItemDef {
  group?: NavGroup;
}

/**
 * Section order drives which uppercase headers appear where. Everything not
 * listed here (i.e. items with no group) falls into the unlabeled bucket
 * rendered before the labeled sections.
 *
 * MANAGEMENT sits above OVERVIEW because on the admin surface it's the
 * primary daily workflow (Tenants / Users / Feature Flags) — Overview
 * (Reports) is a secondary reference view. Tenant-side items follow with
 * FARM / MONITORING, and SYSTEM stays pinned at the bottom.
 */
export const GROUP_ORDER: NavGroup[] = [
  'management',
  'overview',
  'farm',
  'monitoring',
  'system',
];

/**
 * Bucket a flat nav list into a map keyed by group in one pass so the
 * consumer doesn't rescan the list once per section.
 */
export function bucketByGroup(
  navItems: SidebarNavItem[],
): Map<NavGroup | 'ungrouped', SidebarNavItem[]> {
  const map = new Map<NavGroup | 'ungrouped', SidebarNavItem[]>();
  for (const item of navItems) {
    const key = item.group ?? 'ungrouped';
    const existing = map.get(key);
    if (existing) existing.push(item);
    else map.set(key, [item]);
  }
  return map;
}

/**
 * Resolve localized labels for every section header. Falls back to English
 * copy when a locale hasn't shipped the sidebar strings yet.
 */
export function getGroupLabels(t: Translations): Record<NavGroup, string> {
  const sidebar = (t.common as unknown as {
    sidebar?: Partial<Record<string, string>>;
  }).sidebar;

  return {
    overview: sidebar?.groupOverview ?? 'OVERVIEW',
    management: sidebar?.groupManagement ?? 'MANAGEMENT',
    system: sidebar?.groupSystem ?? 'SYSTEM',
    farm: sidebar?.groupFarm ?? 'FARM',
    monitoring: sidebar?.groupMonitoring ?? 'MONITORING',
  };
}

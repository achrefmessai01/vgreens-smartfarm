import { DeviceStatusRange } from '@/generated/graphql';

/** Shared glass-panel styling for all device-dashboard cards. */
export const GLASS_CARD =
  'border-border/40 bg-card/50 shadow-lg shadow-black/5 backdrop-blur-md';

/** Canonical device states, worst-first (drives sort order + summaries). */
export const STATE_ORDER = [
  'never-seen',
  'heartbeat-only',
  'stale',
  'working',
] as const;

export type DeviceState = (typeof STATE_ORDER)[number];

/** Chart/legend colors, aligned with `message_inventory.py`'s color key. */
export const STATE_COLORS: Record<string, string> = {
  working: '#22c55e',
  stale: '#eab308',
  'heartbeat-only': '#f97316',
  'never-seen': '#ef4444',
};

/** Badge styling per state (light + dark). */
export const STATE_BADGE_CLASS: Record<string, string> = {
  working:
    'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
  stale:
    'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  'heartbeat-only':
    'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  'never-seen':
    'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
};

/** Look-back presets shown in the period filter, in display order. */
export const RANGE_PRESETS: readonly DeviceStatusRange[] = [
  DeviceStatusRange.OneDay,
  DeviceStatusRange.SevenDays,
  DeviceStatusRange.OneMonth,
  DeviceStatusRange.SixMonths,
  DeviceStatusRange.OneYear,
] as const;

export function stateSortRank(state: string): number {
  const idx = (STATE_ORDER as readonly string[]).indexOf(state);
  return idx === -1 ? STATE_ORDER.length : idx;
}

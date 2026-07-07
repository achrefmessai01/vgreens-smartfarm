/**
 * Deterministic tenant → avatar color mapping.
 *
 * The redesigned tenants table renders a small colored square with the
 * tenant's initials in place of a real avatar. We want the color to be
 * (a) visually varied across the list, (b) stable for a given tenant so
 * the color doesn't flip when the list is re-sorted or filtered, and
 * (c) picked without a schema change. Hashing the tenant id into a fixed
 * palette satisfies all three.
 *
 * Palette classes are hand-tuned to look good on both light and dark
 * surfaces — muted background + saturated foreground so the initials
 * stay readable against the card background.
 */

export interface TenantAvatarPalette {
  /** Background classes for the avatar square. */
  bg: string;
  /** Text (initials) classes. */
  text: string;
}

// Eight-color palette — enough variety that a page of ~10 tenants rarely
// shows the same color twice, small enough that each color has an easy
// mental identity ("amber tenant", "teal tenant").
const PALETTE: TenantAvatarPalette[] = [
  { bg: 'bg-amber-500/15', text: 'text-amber-500' },
  { bg: 'bg-teal-500/15', text: 'text-teal-400' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
  { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  { bg: 'bg-orange-500/15', text: 'text-orange-400' },
];

/**
 * djb2-style hash — small, dependency-free, and produces well-distributed
 * indices across short strings like UUIDs. We only need buckets, not
 * cryptographic strength.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Force to unsigned so the mod below is always non-negative.
  return hash >>> 0;
}

export function getTenantAvatarPalette(tenantId: string): TenantAvatarPalette {
  if (!tenantId) return PALETTE[0];
  return PALETTE[hashString(tenantId) % PALETTE.length];
}

/**
 * Build a two-letter initials label from a tenant's display name. Falls
 * back to a single character or a neutral "T" so the avatar never renders
 * empty.
 */
export function getTenantInitials(name: string | null | undefined): string {
  if (!name) return 'T';
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return 'T';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

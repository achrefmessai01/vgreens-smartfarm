/**
 * Tenant-specific avatar helpers. Thin wrappers around the shared
 * `avatar-color` module — keeps the existing tenant call-sites untouched
 * while letting the users surface share the same palette and hash.
 */

import {
  getAvatarPalette,
  getInitials,
  type AvatarPalette,
} from '@/lib/avatar-color';

export type TenantAvatarPalette = AvatarPalette;

export function getTenantAvatarPalette(tenantId: string): TenantAvatarPalette {
  return getAvatarPalette(tenantId);
}

export function getTenantInitials(name: string | null | undefined): string {
  return getInitials(name, 'T');
}

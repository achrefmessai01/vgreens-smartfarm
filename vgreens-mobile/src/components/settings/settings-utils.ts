import type { UserRole } from '@/types/user';

export function mapGqlRole(role: string | null | undefined): UserRole {
  if (role === 'TENANT_ADMIN') return 'TENANT_ADMIN';
  if (role === 'VGREENS_ADMIN') return 'VGREENS_ADMIN';
  return 'TENANT_USER';
}

export function daysBetween(from: string | null | undefined): number {
  if (!from) return 0;
  const ts = new Date(from).getTime();
  if (Number.isNaN(ts)) return 0;
  return Math.max(0, Math.floor((Date.now() - ts) / 86_400_000));
}

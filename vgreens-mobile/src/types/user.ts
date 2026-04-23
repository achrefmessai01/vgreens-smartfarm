export type UserRole = 'VGREENS_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface User {
  id: string;
  clerkUserId?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role: UserRole;
  tenantId?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
  status?: UserStatus | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFormErrors {
  email?: string;
  role?: string;
  general?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  VGREENS_ADMIN: 'vGreens Admin',
  TENANT_ADMIN: 'Tenant Admin',
  TENANT_USER: 'Tenant User',
};

export const TENANT_ALLOWED_ROLES: UserRole[] = ['TENANT_ADMIN', 'TENANT_USER'];

export function getRoleAccent(role: UserRole): string {
  switch (role) {
    case 'TENANT_ADMIN':
      return '#8b5cf6';
    case 'TENANT_USER':
      return '#0ea5e9';
    case 'VGREENS_ADMIN':
      return '#f59e0b';
  }
}

export function getRoleGradient(role: UserRole): [string, string] {
  switch (role) {
    case 'TENANT_ADMIN':
      return ['#8b5cf6', '#ec4899'];
    case 'TENANT_USER':
      return ['#0ea5e9', '#ec4899'];
    case 'VGREENS_ADMIN':
      return ['#f59e0b', '#ef4444'];
  }
}

export function getStatusPalette(
  status: UserStatus | null | undefined,
  isActive: boolean,
): { label: string; color: string; bg: string } {
  if (status === 'PENDING')
    return { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  if (isActive && status !== 'INACTIVE')
    return { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.14)' };
  return { label: 'Inactive', color: '#6b7280', bg: 'rgba(107,114,128,0.14)' };
}

export function getUserInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

export function getUserDisplayName(u: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email || 'Unnamed user';
}

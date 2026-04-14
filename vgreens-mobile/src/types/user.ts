export type UserRole = 'VGREENS_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface User {
  id: string;
  clerkUserId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: UserRole;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  status?: UserStatus;
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

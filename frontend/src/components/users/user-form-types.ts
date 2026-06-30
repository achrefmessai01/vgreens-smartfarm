import { UserRole } from '@/generated/graphql';
import type { Tenant } from '@/generated/graphql';

export interface UserFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: UserRole;
  tenantId?: string;
  isActive?: boolean;
}

export interface UserFormErrors {
  email?: string;
  role?: string;
  tenantId?: string;
}

export interface BaseFieldProps {
  isLoading?: boolean;
  errors: UserFormErrors;
}

export interface EmailFieldProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditMode?: boolean;
}

export interface NameFieldsProps extends BaseFieldProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ImageUrlFieldProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RoleFieldProps extends BaseFieldProps {
  value?: UserRole;
  onChange: (value: string) => void;
  allowedRoles?: UserRole[];
  isVGreensAdmin?: boolean;
}

export interface TenantFieldProps extends BaseFieldProps {
  value?: string;
  onChange: (value: string) => void;
  tenants: Tenant[];
}

export interface ActiveStatusFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isLoading?: boolean;
}

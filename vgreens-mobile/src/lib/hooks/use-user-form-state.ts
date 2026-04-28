import { useCallback, useEffect, useState } from 'react';
import { UserRole as GqlUserRole } from '@/generated/graphql';
import type { UserFormErrors, UserRole } from '@/types/user';

interface Editable {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: GqlUserRole;
  isActive?: boolean | null;
}

function mapGqlRole(role: GqlUserRole | undefined): UserRole | undefined {
  if (role === GqlUserRole.TenantAdmin) return 'TENANT_ADMIN';
  if (role === GqlUserRole.TenantUser) return 'TENANT_USER';
  if (role === GqlUserRole.VgreensAdmin) return 'VGREENS_ADMIN';
  return undefined;
}

export function useUserFormState(isEdit: boolean, source: Editable | null) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isEdit || !source || initialized) return;
    setEmail(source.email || '');
    setFirstName(source.firstName || '');
    setLastName(source.lastName || '');
    setRole(mapGqlRole(source.role));
    setIsActive(source.isActive ?? true);
    setInitialized(true);
  }, [isEdit, source, initialized]);

  const clearError = useCallback((key: keyof UserFormErrors) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const next: UserFormErrors = {};
    if (!isEdit && !email.trim()) next.email = 'Email is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Invalid email address';
    if (!role) next.role = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email, role, isEdit]);

  return {
    email, setEmail,
    firstName, setFirstName,
    lastName, setLastName,
    role, setRole,
    isActive, setIsActive,
    errors, clearError,
    validate,
  };
}

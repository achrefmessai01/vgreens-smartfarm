'use client';

import { useMeQuery, UserRole } from '@/generated/graphql';
import { useAuth } from '@clerk/nextjs';

export function useCurrentUser() {
  const { isSignedIn } = useAuth();

  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'network-only',
    skip: !isSignedIn,
  });

  const user = data?.me;
  const role = user?.role as UserRole | undefined;

  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  const isTenantAdmin = role === UserRole.TenantAdmin;
  const isTenantUser = role === UserRole.TenantUser;

  return {
    user,
    role,
    loading,
    error,
    isVGreensAdmin,
    isTenantAdmin,
    isTenantUser,
  };
}

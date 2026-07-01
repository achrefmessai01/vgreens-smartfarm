'use client';

import { useMeQuery, UserRole } from '@/generated/graphql';
import { useAuth } from '@clerk/nextjs';

export function useCurrentUser() {
  const { isSignedIn } = useAuth();

  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isSignedIn,
  });

  const user = data?.me;
  const role = user?.role as UserRole | undefined;

  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  const isVGreensMember = role === UserRole.VgreensMember;
  const isTenantAdmin = role === UserRole.TenantAdmin;
  const isTenantUser = role === UserRole.TenantUser;

  // Whether either internal vGreens role — admin's read-only sibling shares
  // every visibility rule the admin gets, so most callsites want this flag
  // instead of `isVGreensAdmin` alone.
  const isVGreensInternal = isVGreensAdmin || isVGreensMember;

  // View-only mode: UI writes must be disabled and tooltip'd. Currently only
  // VGREENS_MEMBER; keeping this as a named flag makes it easy to extend if
  // another read-only role is added without hunting for every callsite.
  const isViewOnly = isVGreensMember;

  return {
    user,
    role,
    loading,
    error,
    isVGreensAdmin,
    isVGreensMember,
    isVGreensInternal,
    isViewOnly,
    isTenantAdmin,
    isTenantUser,
  };
}

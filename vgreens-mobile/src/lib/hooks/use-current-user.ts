import { useAuth } from '@clerk/clerk-expo';
import { UserRole as GqlUserRole, useMeQuery } from '@/generated/graphql';

export function useCurrentUser() {
  const { isSignedIn } = useAuth();

  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'network-only',
    skip: !isSignedIn,
  });

  const user = data?.me ?? null;
  const role = user?.role ?? null;

  return {
    user,
    role,
    loading,
    error,
    isVGreensAdmin: role === GqlUserRole.VgreensAdmin,
    isTenantAdmin: role === GqlUserRole.TenantAdmin,
    isTenantUser: role === GqlUserRole.TenantUser,
  };
}

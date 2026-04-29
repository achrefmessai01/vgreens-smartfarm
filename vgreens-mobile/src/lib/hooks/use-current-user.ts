import { useAuth } from '@clerk/clerk-expo';
import { UserRole as GqlUserRole, useMeQuery } from '@/generated/graphql';

export function useCurrentUser() {
  const { isSignedIn } = useAuth();

  // cache-first so every screen that calls useCurrentUser doesn't re-fetch
  // the same /me payload over the network. The "me" record rarely changes
  // mid-session, and the hook is mounted in many components (tabs, layouts,
  // hooks). On mobile each network round-trip costs noticeably more than on
  // web (no HTTP keep-alive across native fetches), so this single change
  // removes a long tail of redundant /me requests.
  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
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

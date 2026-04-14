import { useQuery } from '@apollo/client';
import { useAuth } from '@clerk/clerk-expo';
import { ME_QUERY } from '@/graphql/queries/user.queries';

export type UserRole = 'VGREENS_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';

interface MeUser {
  id: string;
  clerkUserId: string;
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
}

interface MeQueryData {
  me: MeUser;
}

export function useCurrentUser() {
  const { isSignedIn } = useAuth();

  const { data, loading, error } = useQuery<MeQueryData>(ME_QUERY, {
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
    isVGreensAdmin: role === 'VGREENS_ADMIN',
    isTenantAdmin: role === 'TENANT_ADMIN',
    isTenantUser: role === 'TENANT_USER',
  };
}

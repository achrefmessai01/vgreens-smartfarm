import { UserRole as GqlUserRole } from '@/generated/graphql';
import type { UserRole } from '@/types/user';

export function toGqlUserRole(role?: UserRole): GqlUserRole | undefined {
  switch (role) {
    case 'TENANT_ADMIN':
      return GqlUserRole.TenantAdmin;
    case 'TENANT_USER':
      return GqlUserRole.TenantUser;
    case 'VGREENS_ADMIN':
      return GqlUserRole.VgreensAdmin;
    default:
      return undefined;
  }
}

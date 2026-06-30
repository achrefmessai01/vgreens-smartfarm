import { UserRole } from '@common/enums';
import { ForbiddenException } from '@common/exceptions';
import { User } from '@modules/users/entities/user.entity';

/**
 * Centralised "which tenant is this request scoped to?" logic.
 *
 * Background — the `TenantInterceptor` already exempts VGREENS_ADMIN from
 * default per-tenant scoping (so admin requests arrive with no tenantId set,
 * meaning "all tenants"). To let admins drill into a single tenant from the
 * UI (the global tenant selector), every per-tenant resolver accepts an
 * optional `tenantId` argument. This helper applies the rules consistently:
 *
 *   • VGREENS_ADMIN: honour `argTenantId` if provided, else `undefined`
 *     (which downstream services interpret as "all tenants"). This is the
 *     security-critical override path.
 *   • TENANT_ADMIN / TENANT_USER: ignore `argTenantId` outright — non-admin
 *     callers can never escape their own tenant — and fall back to the
 *     interceptor-derived `currentUser.tenantId`. If that is missing while
 *     `requireForNonAdmin` is true, we throw to fail fast rather than
 *     silently leaking across tenants.
 *
 * Keep this in one place so every resolver behaves identically; subtle drift
 * here is a tenant-isolation bug waiting to happen.
 */
export function resolveTenantId(
  currentUser: User,
  argTenantId?: string | null,
  requireForNonAdmin = true,
): string | undefined {
  if (currentUser.role === UserRole.VGREENS_ADMIN) {
    // Admin chose a tenant from the selector → scope to it. Otherwise
    // undefined means "look across all tenants".
    return argTenantId ?? undefined;
  }

  // Non-admins cannot override. If they tried, treat it as a tenant-isolation
  // violation — but only when the override would actually move them to a
  // *different* tenant. Silently dropping a matching value would invite UI
  // code that relies on it.
  if (argTenantId && argTenantId !== currentUser.tenantId) {
    throw new ForbiddenException(
      'You are not allowed to query data for another tenant.',
    );
  }

  if (!currentUser.tenantId) {
    if (requireForNonAdmin) {
      throw new ForbiddenException('Tenant ID is required.');
    }
    return undefined;
  }

  return currentUser.tenantId;
}

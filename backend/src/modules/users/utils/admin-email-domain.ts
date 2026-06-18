import { UserRole } from '@common/enums';

/**
 * Admin-role email-domain rule (VSL-182).
 *
 * Allowed email domains are configured here in code (no DB column). The check
 * runs only when a user is created with an admin role. If a domain list exists
 * for the role/tenant and the email doesn't match it, creation is rejected.
 * Roles/tenants with no configured domain are not restricted.
 */

/** Domains allowed to hold the VGREENS_ADMIN role. */
const VGREENS_ADMIN_DOMAINS = ['v-greens.com'];

/**
 * Allowed TENANT_ADMIN email domains, keyed by tenant id. Only tenants listed
 * here are enforced. Tenant ids differ per database, so add each environment's
 * ids (dev ids below — add staging/prod ids when known).
 */
const TENANT_ADMIN_DOMAINS: Record<string, string[]> = {
  '4634bb57-fb6c-40b6-8a18-89cae4e0ca43': ['mahls-obsthof.de'], // Klaus Mahl
  'ed458942-f834-4f06-aa21-8d46b5ed8829': ['genusshofknaup.de'], // Christian Knaup
  '455df40c-ea3d-4b19-a555-68b8cec5b881': ['gemuesering-boehmer.de'], // Maximilian Larin (GMR Schkölen)
  '254862df-36b9-4f63-b46a-e505a02c9476': ['gemuesering-boehmer.de'], // Stefan Brill (GMR Meinsdorf)
};

/** Lower-cased domain after the last '@', or null when missing/malformed. */
function emailDomain(email?: string | null): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

function matches(email: string | null | undefined, domains: string[]): boolean {
  const domain = emailDomain(email);
  return !!domain && domains.some((d) => d.trim().toLowerCase() === domain);
}

/**
 * Returns an error message if the email is not allowed for the given admin
 * role, or `null` if it's allowed (or the role isn't an admin role / has no
 * configured domain). Used by createUser to reject + show a clear message.
 */
export function getAdminEmailDomainError(
  role: UserRole | undefined | null,
  email: string | undefined | null,
  tenantId: string | undefined | null,
): string | null {
  if (role === UserRole.VGREENS_ADMIN) {
    return matches(email, VGREENS_ADMIN_DOMAINS)
      ? null
      : `Only emails on ${VGREENS_ADMIN_DOMAINS.map((d) => `@${d}`).join(', ')} can be assigned the vGreens admin role.`;
  }

  if (role === UserRole.TENANT_ADMIN) {
    const domains = tenantId ? TENANT_ADMIN_DOMAINS[tenantId] : undefined;
    if (!domains || domains.length === 0) {
      return null; // no domain configured for this tenant → not restricted
    }
    return matches(email, domains)
      ? null
      : `Only emails on ${domains.map((d) => `@${d}`).join(', ')} can be assigned the tenant admin role for this tenant.`;
  }

  return null; // non-admin roles are unrestricted
}

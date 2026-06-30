import { emailMatchesDomains, normalizeDomain } from './email-domain';

/**
 * Per-tenant email-domain whitelist enforcement.
 *
 * Backs `Tenant.allowedDomains`. An empty (or missing) list means the tenant is
 * unrestricted — any address may be assigned. A non-empty list means the
 * assignee's email must end with one of the listed domains (case-insensitive,
 * compared on the bare-domain form so a list value of "@v-greens.com" and
 * "v-greens.com" behave identically).
 *
 * The check is intentionally separate from the in-code admin-role rule in
 * `admin-email-domain.ts`: that one enforces a static list keyed by role, this
 * one enforces a tenant's own DB-stored whitelist for any user added to it.
 */

/**
 * Strip empties + duplicates from a user-supplied list and normalize each entry
 * to the canonical bare-lowercase form. Stable order (first occurrence wins).
 * Pass the result through before persisting to the column so the DB never
 * carries cosmetic noise.
 */
export function sanitizeAllowedDomains(input: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const normalized = normalizeDomain(raw);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

/**
 * Returns a human-readable error message if `email` is not allowed by the
 * tenant's whitelist, or `null` when it's allowed. An empty list always
 * returns `null` (unrestricted). The message lists the allowed domains so
 * callers can surface a clear reason in the UI.
 */
export function getTenantDomainError(
  email: string | null | undefined,
  allowedDomains: readonly string[] | null | undefined,
): string | null {
  if (!allowedDomains || allowedDomains.length === 0) return null;
  if (emailMatchesDomains(email, allowedDomains)) return null;
  const list = allowedDomains
    .map((d) => `@${normalizeDomain(d) ?? d}`)
    .join(', ');
  return `This tenant only accepts users with emails on ${list}.`;
}

/**
 * Shared, pure helpers for working with the domain part of an email address.
 *
 * Used by both the in-code admin-role rules (`admin-email-domain.ts`) and the
 * per-tenant whitelist enforced from `Tenant.allowedDomains`. Keeping the
 * extraction/matching logic in one place means both call sites agree on what
 * counts as a "domain" — lowercased, trimmed, no leading "@", taken from after
 * the last "@" in the address.
 */

/** Lower-cased domain after the last `@`, or null when missing/malformed. */
export function emailDomain(email?: string | null): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

/**
 * Normalize a user-entered domain to the canonical lowercase, bare form (no
 * leading "@", no surrounding whitespace). Empty/whitespace-only inputs return
 * `null` so callers can drop them. Anything else is returned untouched apart
 * from case + the optional `@` prefix.
 */
export function normalizeDomain(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
}

/** True when the email's domain is in `domains` (case-insensitive). */
export function emailMatchesDomains(
  email: string | null | undefined,
  domains: readonly string[],
): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return domains.some((d) => normalizeDomain(d) === domain);
}

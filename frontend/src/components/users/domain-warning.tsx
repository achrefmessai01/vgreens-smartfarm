'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useI18n } from '@/i18n';

interface DomainWarningProps {
  /** Email currently entered/loaded for the user. */
  email: string | null | undefined;
  /** allowedDomains list from the currently selected destination tenant. */
  allowedDomains: readonly string[] | null | undefined;
  /**
   * True when this is an edit and the tenant has changed (the user is being
   * moved between tenants) — surfaces an extra advisory line.
   */
  isTransfer: boolean;
}

/**
 * Inline advisory shown beneath the tenant picker when the selected tenant
 * restricts email domains and the entered address won't satisfy that rule.
 * The backend still enforces the rule on submit; this is purely a friendly
 * heads-up so the admin doesn't get a wall-of-text error from the API.
 */
export function DomainWarning({
  email,
  allowedDomains,
  isTransfer,
}: DomainWarningProps) {
  const { t } = useI18n();
  const tenantsT = t.pages.admin.tenants;

  if (!allowedDomains || allowedDomains.length === 0) return null;

  const normalizedEmailDomain = extractDomain(email);
  const allowed = allowedDomains.map((d) =>
    d.trim().toLowerCase().replace(/^@/, ''),
  );
  const domainOk =
    !!normalizedEmailDomain && allowed.includes(normalizedEmailDomain);

  // Only nag when something is actually wrong; if the email already matches,
  // staying silent keeps the form quiet.
  if (domainOk && !isTransfer) return null;

  const allowedList = allowed.map((d) => `@${d}`).join(', ');

  return (
    <div
      role="alert"
      className="flex gap-2 rounded-md border border-amber-500/40 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        {!domainOk && <p>{`${tenantsT.domainNotAllowed} (${allowedList})`}</p>}
        {isTransfer && <p>{tenantsT.domainTransferWarning}</p>}
      </div>
    </div>
  );
}

function extractDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

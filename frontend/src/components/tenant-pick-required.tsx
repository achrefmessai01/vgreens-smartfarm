'use client';

import * as React from 'react';
import { Building2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useSelectedTenantId } from '@/lib/contexts/selected-tenant-context';

/**
 * VGREENS_ADMIN users are not bound to any tenant. Until they pick one via the
 * navbar selector, tenant-scoped pages have nothing useful to show — every
 * query would either return the cross-tenant union (confusing) or be skipped
 * (empty). This guard renders a "pick a tenant first" empty state in that
 * case, and otherwise passes children through unchanged.
 *
 * Non-admin users always have a tenant from their session, so the guard is a
 * no-op for them.
 */
export function TenantPickRequired({ children }: { children: React.ReactNode }) {
  const { isVGreensAdmin, loading } = useCurrentUser();
  const selectedTenantId = useSelectedTenantId();

  // While we don't yet know the role, render nothing rather than flash the
  // empty state at non-admins.
  if (loading) return <>{children}</>;
  if (!isVGreensAdmin || selectedTenantId) return <>{children}</>;

  return <TenantPickRequiredEmptyState />;
}

function TenantPickRequiredEmptyState() {
  const { t } = useI18n();
  const labels = t.common.tenantSelector;
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="bg-card text-card-foreground border-border max-w-md rounded-2xl border p-8 text-center shadow-sm">
        <div className="bg-muted text-muted-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Building2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-foreground mb-2 text-lg font-semibold">
          {labels.pickRequiredTitle}
        </h2>
        <p className="text-muted-foreground text-sm">
          {labels.pickRequiredDescription}
        </p>
      </div>
    </div>
  );
}

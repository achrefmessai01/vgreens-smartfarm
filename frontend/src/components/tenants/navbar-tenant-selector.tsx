'use client';

import { Building2 } from 'lucide-react';
import { StyledSelect } from '@/components/ui/styled-select';
import { useI18n } from '@/i18n';
import { useTenantsQuery } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  useSelectedTenantId,
  useSetSelectedTenantId,
} from '@/lib/contexts/selected-tenant-context';

/**
 * Global tenant selector that lives in the app navbar. Only VGREENS_ADMIN
 * users see it — for everyone else it renders nothing and the underlying
 * `SelectedTenantProvider` value stays `null` (which means "use my own
 * tenant" on the backend).
 *
 * Backed by the shared `SelectedTenantProvider`, so changing the value here
 * propagates to every hook that consumes `useTenantIdVariable()`. The
 * provider also persists the choice across navigations + reloads.
 *
 * "All tenants" sentinel: we map the cross-tenant view to a sentinel value
 * because `StyledSelect` (Radix) cannot represent an empty-string item. When
 * the admin picks it we clear the selection back to `null`.
 */
const ALL_TENANTS_SENTINEL = '__all__';

export function NavbarTenantSelector() {
  const { t } = useI18n();
  const { isVGreensAdmin } = useCurrentUser();
  const selectedTenantId = useSelectedTenantId();
  const setSelectedTenantId = useSetSelectedTenantId();

  const { data } = useTenantsQuery({
    skip: !isVGreensAdmin,
    fetchPolicy: 'cache-first',
  });

  if (!isVGreensAdmin) return null;

  const tenants = data?.tenants ?? [];
  if (tenants.length === 0) return null;

  // Defensive lookup — every locale ships `common.tenantSelector` but a stale
  // Turbopack cache during HMR can briefly hand us a `t` without it. Fall back
  // to English copy so the navbar selector never crashes the page.
  const labels = t.common?.tenantSelector;
  const allTenantsLabel = labels?.allTenants ?? 'All tenants';
  const placeholder = labels?.placeholder ?? 'Select tenant';

  const handleChange = (value: string) => {
    if (value === ALL_TENANTS_SENTINEL) {
      setSelectedTenantId(null);
    } else {
      setSelectedTenantId(value);
    }
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Building2 className="text-muted-foreground h-4 w-4" />
      <StyledSelect
        value={selectedTenantId ?? ALL_TENANTS_SENTINEL}
        onValueChange={handleChange}
        options={[
          { label: allTenantsLabel, value: ALL_TENANTS_SENTINEL },
          ...tenants.map((tenant) => ({
            label: tenant.name,
            value: tenant.id,
          })),
        ]}
        triggerClassName="h-9 w-[200px] font-medium"
        placeholder={placeholder}
      />
    </div>
  );
}

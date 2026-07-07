'use client';

import { useI18n } from '@/i18n';
import { useTenantsQuery } from '@/generated/graphql';
import {
  useSelectedTenantId,
  useSetSelectedTenantId,
} from '@/lib/contexts/selected-tenant-context';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { StyledSelect } from '@/components/ui/styled-select';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Sentinel value we use in the Select to represent "no tenant selected /
 * cross-tenant view". Radix Select can't take an empty string as an item
 * value, so we translate this sentinel to `null` in the setter.
 */
const ALL_TENANTS_SENTINEL = '__all__';

interface SidebarTenantCardProps {
  /** When collapsed we render the tenant card in icon-only mode. */
  isCollapsed: boolean;
  /** True on the mobile sheet where collapse is always false. */
  mobile: boolean;
}

/**
 * Sidebar tenant selector card — only rendered for VGREENS_ADMIN and
 * VGREENS_MEMBER (both of whom can pivot between tenants). Reuses the shared
 * `SelectedTenantProvider` so any change here also updates the in-header
 * `NavbarTenantSelector`.
 *
 * When the sidebar is collapsed the card shrinks to a single icon so it still
 * hints at the tenant context without dominating the rail.
 */
export function SidebarTenantCard({
  isCollapsed,
  mobile,
}: SidebarTenantCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const selectedTenantId = useSelectedTenantId();
  const setSelectedTenantId = useSetSelectedTenantId();
  // Defensive skip: the parent gates rendering to internal users, but hooks
  // fire before that check runs on the first render pass. Skipping keeps a
  // tenant-user session from ever hitting the admin-only listTenants query.
  const { isVGreensInternal } = useCurrentUser();

  const { data } = useTenantsQuery({
    fetchPolicy: 'cache-first',
    skip: !isVGreensInternal,
  });
  const tenants = data?.tenants ?? [];
  if (tenants.length === 0) return null;

  const sidebar = (t.common as unknown as {
    sidebar?: Partial<{ tenantLabel: string }>;
  }).sidebar;
  const tenantLabel = sidebar?.tenantLabel ?? 'TENANT';

  const labels = t.common?.tenantSelector;
  const allTenantsLabel = labels?.allTenants ?? 'All tenants';
  const placeholder = labels?.placeholder ?? 'Select tenant';

  const handleChange = (value: string) => {
    if (value === ALL_TENANTS_SENTINEL) {
      setSelectedTenantId(null);
    } else {
      setSelectedTenantId(value);
      router.push('/tenant/farm-overview');
    }
  };

  // Collapsed rail: single icon that expands the sidebar when clicked. We keep
  // the tooltip-worthy label on the button so a screen reader still gets
  // context.
  if (isCollapsed && !mobile) {
    const currentName =
      tenants.find((tenant) => tenant.id === selectedTenantId)?.name ??
      allTenantsLabel;
    return (
      <div className="px-3 pt-3">
        <div
          className="border-border/60 flex items-center justify-center rounded-lg border p-2"
          title={currentName}
          aria-label={`${tenantLabel}: ${currentName}`}
        >
          <Building2 className="text-muted-foreground h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="border-border/60 bg-muted/30 flex flex-col gap-1.5 rounded-lg border p-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
          <Building2 className="h-3 w-3" />
          {tenantLabel}
        </div>
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
          triggerClassName="h-8 w-full border-0 bg-transparent px-0 text-sm font-semibold hover:bg-transparent"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

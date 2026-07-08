'use client';

import { TableEmptyState } from '@/components/ui/table-empty-state';
import type { TenantData } from '@/lib/graphql-compat';
import { TenantGridCard } from './tenant-grid-card';

interface TenantGridViewTranslations {
  active: string;
  inactive: string;
  configure: string;
  noPhone: string;
  edit: string;
  delete: string;
  noTenants: string;
  noTenantsDescription: string;
}

interface TenantGridViewProps {
  tenants: TenantData[];
  onEdit: (tenant: TenantData) => void;
  onDelete: (tenant: TenantData) => void;
  onManageFeatures?: (tenant: TenantData) => void;
  onCardClick?: (tenant: TenantData) => void;
  translations: TenantGridViewTranslations;
}

/**
 * Responsive card grid for the tenants view. Purely presentational — the
 * parent owns the tenants list (and any filtering/sorting applied before
 * we get here). Explicit breakpoints step from 1 → 2 → 3 columns
 */
export function TenantGridView({
  tenants,
  onEdit,
  onDelete,
  onManageFeatures,
  onCardClick,
  translations,
}: TenantGridViewProps) {
  if (tenants.length === 0) {
    return (
      <div className="border-border/60 flex min-h-[240px] items-center justify-center rounded-xl border">
        <TableEmptyState
          title={translations.noTenants}
          description={translations.noTenantsDescription}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tenants.map((tenant) => (
        <TenantGridCard
          key={tenant.id}
          tenant={tenant}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageFeatures={onManageFeatures}
          onClick={onCardClick}
          translations={{
            active: translations.active,
            inactive: translations.inactive,
            configure: translations.configure,
            noPhone: translations.noPhone,
            edit: translations.edit,
            delete: translations.delete,
          }}
        />
      ))}
    </div>
  );
}

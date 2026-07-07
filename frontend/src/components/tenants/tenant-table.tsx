'use client';

import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { WriteActionButton } from '@/components/ui/write-action-button';
import type { TenantData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useTenantTableFilters } from '@/lib/hooks/use-tenant-table-filters';
import { Plus } from 'lucide-react';
import { useTenantRow } from './tenant-table-rows';

interface TenantTableProps {
  tenants: TenantData[];
  onEdit: (tenant: TenantData) => void;
  onDelete: (tenant: TenantData) => void;
  onCreate?: () => void;
  onViewUsers?: (tenant: TenantData) => void;
  onManageFeatures?: (tenant: TenantData) => void;
  onRowClick?: (tenant: TenantData) => void;
}

/**
 * Tenant Management table shell. Structural mirror of `UserManagementTable`:
 * search + status filter state lives in `useTenantTableFilters` and this
 * component stays presentational — columns, row/card renderers, and the
 * `DataTable` toolbar wiring only.
 */
export function TenantTable({
  tenants,
  onEdit,
  onDelete,
  onCreate,
  onViewUsers,
  onManageFeatures,
  onRowClick,
}: TenantTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const { filteredTenants, searchQuery, setSearchQuery, filterConfigs } =
    useTenantTableFilters({ tenants });

  const { renderRow, renderCard } = useTenantRow({
    onEdit,
    onDelete,
    onViewUsers,
    onManageFeatures,
    translations: {
      active: t.pages.admin.tenants.active,
      inactive: t.pages.admin.tenants.inactive,
      company: t.pages.admin.tenants.company,
      email: t.pages.admin.tenants.email,
      phone: t.pages.admin.tenants.phone,
      viewUsers: t.pages.admin.tenants.viewUsers,
      manageFeatures: t.pages.admin.tenants.manageFeatures,
    },
  });

  const columns: Column<TenantData>[] = [
    { key: 'name', header: t.pages.admin.tenants.name },
    { key: 'companyName', header: t.pages.admin.tenants.company },
    { key: 'email', header: t.pages.admin.tenants.email },
    { key: 'phone', header: t.pages.admin.tenants.phone },
    { key: 'users', header: t.pages.admin.tenants.users },
    { key: 'isActive', header: t.pages.admin.tenants.status },
    {
      key: 'actions',
      header: t.pages.admin.tenants.actions,
      headerClassName: 'text-right',
    },
  ];

  // When the page hasn't been given an `onCreate` we skip the toolbar action
  // slot entirely — matches the users table which uses the same pattern.
  const headerActions = onCreate ? (
    <WriteActionButton onClick={onCreate}>
      <Plus className="h-4 w-4" />
      {t.pages.admin.tenants.createTenant}
    </WriteActionButton>
  ) : undefined;

  return (
    <div
      className={
        isMobile ? 'flex flex-col gap-4' : 'flex h-full min-h-0 flex-col gap-4'
      }
    >
      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
        <DataTable
          data={filteredTenants}
          columns={columns}
          renderRow={renderRow}
          renderCard={renderCard}
          onRowClick={onRowClick}
          searchConfig={{
            placeholder: t.pages.admin.tenants.searchPlaceholder,
          }}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterConfigs={filterConfigs}
          headerActions={headerActions}
          emptyState={{
            title: t.pages.admin.tenants.noTenants,
            description: t.pages.admin.tenants.noTenantsDescription,
          }}
          paginationVariant="compact"
          defaultPageSize={paginationConfig.defaultPageSize}
          pageSizeOptions={paginationConfig.pageSizeOptions}
          paginationLabels={paginationConfig.paginationLabels}
          responsiveBreakpoint="xl"
        />
      </div>
    </div>
  );
}

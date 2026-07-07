'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import type { TenantData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useTenantsViewMode } from '@/lib/hooks/use-tenants-view-mode';
import { useTenantTableFilters } from '@/lib/hooks/use-tenant-table-filters';
import { cn } from '@/lib/utils';
import { TenantGridView } from './tenant-grid-view';
import { useTenantColumns } from './tenant-table-columns';
import { useTenantRow } from './tenant-table-rows';
import { TenantsToolbar } from './tenants-toolbar';
import { TenantViewToggle } from './tenant-view-toggle';

interface TenantTableProps {
  tenants: TenantData[];
  onEdit: (tenant: TenantData) => void;
  onDelete: (tenant: TenantData) => void;
  onManageFeatures?: (tenant: TenantData) => void;
  onRowClick?: (tenant: TenantData) => void;
}

/**
 * Tenants surface orchestrator. Owns the view-mode toggle (list ↔ grid) and
 * renders a single shared toolbar (search + filter + view toggle) above the
 * active surface, then delegates to either `DataTable` (list) or
 * `TenantGridView` (grid). All state lives in hooks so this component stays
 * purely compositional.
 */
export function TenantTable({
  tenants,
  onEdit,
  onDelete,
  onManageFeatures,
  onRowClick,
}: TenantTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const { viewMode, setViewMode } = useTenantsViewMode();
  const {
    filteredTenants,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  } = useTenantTableFilters({ tenants });

  const rowTranslations = {
    active: t.pages.admin.tenants.active,
    inactive: t.pages.admin.tenants.inactive,
    configure: t.pages.admin.tenants.configure,
    noPhone: t.pages.admin.tenants.noPhone,
    edit: t.pages.admin.tenants.editTenant,
    delete: t.pages.admin.tenants.deleteTenant,
  };

  const { renderRow, renderCard } = useTenantRow({
    onEdit,
    onDelete,
    onManageFeatures,
    onCardClick: onRowClick,
    translations: rowTranslations,
  });

  const columns = useTenantColumns({ sortDirection, toggleSort });

  const viewToggle = (
    <TenantViewToggle
      value={viewMode}
      onChange={setViewMode}
      labels={{
        list: t.pages.admin.tenants.viewList,
        grid: t.pages.admin.tenants.viewGrid,
      }}
    />
  );

  return (
    <div
      className={cn(
        isMobile ? 'flex flex-col gap-2' : 'flex h-full min-h-0 flex-col gap-2',
      )}
    >
      <TenantsToolbar
        searchPlaceholder={t.pages.admin.tenants.searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterConfigs={filterConfigs}
        headerActions={viewToggle}
      />
      {viewMode === 'grid' ? (
        <div
          className={
            isMobile ? '' : 'scrollbar-hide min-h-0 flex-1 overflow-y-auto pr-1'
          }
        >
          <TenantGridView
            tenants={filteredTenants}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageFeatures={onManageFeatures}
            onCardClick={onRowClick}
            translations={{
              ...rowTranslations,
              noTenants: t.pages.admin.tenants.noTenants,
              noTenantsDescription:
                t.pages.admin.tenants.noTenantsDescription,
            }}
          />
        </div>
      ) : (
        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <DataTable
            data={filteredTenants}
            columns={columns}
            renderRow={renderRow}
            renderCard={renderCard}
            onRowClick={onRowClick}
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
      )}
    </div>
  );
}

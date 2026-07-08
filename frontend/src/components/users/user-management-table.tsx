'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import { User, type Tenant } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useUserTableFilters } from '@/lib/hooks/use-user-table-filters';
import { useUserTableTranslations } from '@/lib/hooks/use-user-table-translations';
import { useUsersViewMode } from '@/lib/hooks/use-users-view-mode';
import { cn } from '@/lib/utils';
import { UserGridView } from './user-grid-view';
import { useUserManagementColumns } from './user-management-table-columns';
import { useUserManagementRow } from './user-management-table-rows';
import { UsersHeaderActions } from './users-header-actions';
import { UsersToolbar } from './users-toolbar';

interface UserManagementTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate?: () => void;
  isLoading?: boolean;
  /** Hide the tenant column when scoped to a single tenant (tenant surface). */
  hideTenantColumn?: boolean;
  /** Optional tenants list; enables the Tenant filter dropdown on admin. */
  tenants?: Tenant[];
}

/**
 * Users surface orchestrator. Owns the view-mode toggle (list ↔ grid) and
 * renders a single shared toolbar (search + filters + view toggle +
 * optional Create button) above the active surface, then delegates to
 * either `DataTable` (list) or `UserGridView` (grid). All state lives in
 * hooks so this component stays purely compositional. Mirrors
 * `TenantTable`.
 */
export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  hideTenantColumn = false,
  tenants,
}: UserManagementTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const { viewMode, setViewMode } = useUsersViewMode();
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  } = useUserTableFilters({ users, tenants, hideTenantColumn });
  const { roleLabels, rowTranslations, gridTranslations } =
    useUserTableTranslations();

  const { renderRow, renderCard } = useUserManagementRow({
    onEdit,
    onDelete,
    isLoading,
    hideTenantColumn,
    roleLabels,
    translations: rowTranslations,
  });

  const columns = useUserManagementColumns({
    sortDirection,
    toggleSort,
    hideTenantColumn,
  });

  return (
    <div
      className={cn(
        isMobile ? 'flex flex-col gap-2' : 'flex h-full min-h-0 flex-col gap-2',
      )}
    >
      <UsersToolbar
        searchPlaceholder={t.pages.users.searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterConfigs={filterConfigs}
        headerActions={
          <UsersHeaderActions
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={onCreate}
            isLoading={isLoading}
          />
        }
      />
      {viewMode === 'grid' ? (
        <div
          className={
            isMobile ? '' : 'scrollbar-hide min-h-0 flex-1 overflow-y-auto pr-1'
          }
        >
          <UserGridView
            users={filteredUsers}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            hideTenantColumn={hideTenantColumn}
            roleLabels={roleLabels}
            translations={gridTranslations}
          />
        </div>
      ) : (
        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <DataTable
            data={filteredUsers}
            columns={columns}
            renderRow={renderRow}
            renderCard={renderCard}
            emptyState={{
              title: t.pages.users.noUsers,
              description: t.pages.users.noUsersDescription,
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

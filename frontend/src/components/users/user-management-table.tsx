'use client';

import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { User, UserRole, type Tenant } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useUserTableFilters } from '@/lib/hooks/use-user-table-filters';
import { Plus } from 'lucide-react';
import { useUserManagementRow } from './user-management-table-rows';

interface UserManagementTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate?: () => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean; // Hide tenant column for tenant users
  /**
   * Optional tenants list. When provided alongside a visible tenant column,
   * the toolbar exposes a Tenant filter dropdown (admin surface only).
   */
  tenants?: Tenant[];
}

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
  const { filteredUsers, searchQuery, setSearchQuery, filterConfigs } =
    useUserTableFilters({ users, tenants, hideTenantColumn });

  const roleLabels: Record<UserRole, string> = {
    VGREENS_ADMIN: t.pages.admin.users.roleVgreensAdmin,
    TENANT_ADMIN: t.pages.admin.users.roleTenantAdmin,
    TENANT_USER: t.pages.admin.users.roleTenantUser,
  };

  // Get row and card renderers from dedicated modules
  const { renderRow, renderCard } = useUserManagementRow({
    onEdit,
    onDelete,
    isLoading,
    hideTenantColumn,
    roleLabels,
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: t.pages.admin.users.name,
    },
    {
      key: 'email',
      header: t.pages.admin.users.email,
    },
    {
      key: 'role',
      header: t.pages.admin.users.role,
    },
    ...(hideTenantColumn
      ? []
      : [
          {
            key: 'tenant',
            header: t.pages.admin.users.tenant,
          },
        ]),
    {
      key: 'isActive',
      header: t.pages.admin.users.status,
    },
    {
      key: 'actions',
      header: t.pages.admin.users.actions,
      headerClassName: 'text-right',
    },
  ];

  // Render the Create button inside the table toolbar (right-aligned via
  // `headerActions`) so it sits on the same row as the search + filter
  // controls instead of consuming a separate row above the table.
  const headerActions = onCreate ? (
    <Button onClick={onCreate} disabled={isLoading}>
      <Plus className="h-4 w-4" />
      {t.pages.admin.users.createUser}
    </Button>
  ) : undefined;

  return (
    <div
      className={
        isMobile ? 'flex flex-col gap-4' : 'flex h-full min-h-0 flex-col gap-4'
      }
    >
      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
        <DataTable
          data={filteredUsers}
          columns={columns}
          renderRow={renderRow}
          renderCard={renderCard}
          searchConfig={{ placeholder: t.pages.users.searchPlaceholder }}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterConfigs={filterConfigs}
          headerActions={headerActions}
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
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import type { Tenant } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { Plus } from 'lucide-react';
import { useTenantRow } from './tenant-table-rows';

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onCreate: () => void;
  onViewUsers?: (tenant: Tenant) => void;
  onManageFeatures?: (tenant: Tenant) => void;
  onRowClick?: (tenant: Tenant) => void;
}

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

  // Get row and card renderers from dedicated modules
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

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      header: t.pages.admin.tenants.name,
    },
    {
      key: 'companyName',
      header: t.pages.admin.tenants.company,
    },
    {
      key: 'email',
      header: t.pages.admin.tenants.email,
    },
    {
      key: 'phone',
      header: t.pages.admin.tenants.phone,
    },
    {
      key: 'users',
      header: t.pages.admin.tenants.users,
    },
    {
      key: 'isActive',
      header: t.pages.admin.tenants.status,
    },
    {
      key: 'actions',
      header: t.pages.admin.tenants.actions,
      headerClassName: 'text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex justify-end">
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t.pages.admin.tenants.createTenant}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <DataTable
          data={tenants}
          columns={columns}
          renderRow={renderRow}
          renderCard={renderCard}
          onRowClick={onRowClick}
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

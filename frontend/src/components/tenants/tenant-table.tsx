'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import type { Tenant } from '@/generated/graphql'
import { Edit2, Trash2, Plus, Users, Settings } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface TenantTableProps {
  tenants: Tenant[]
  onEdit: (tenant: Tenant) => void
  onDelete: (tenant: Tenant) => void
  onCreate: () => void
  onViewUsers?: (tenant: Tenant) => void
  onManageFeatures?: (tenant: Tenant) => void
}

export function TenantTable({
  tenants,
  onEdit,
  onDelete,
  onCreate,
  onViewUsers,
  onManageFeatures,
}: TenantTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()
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
  ]

  const renderRow = (tenant: Tenant) => (
    <>
      <TableCell className="font-medium">{tenant.name}</TableCell>
      <TableCell>{tenant.companyName || '-'}</TableCell>
      <TableCell>{tenant.email || '-'}</TableCell>
      <TableCell>{tenant.phone || '-'}</TableCell>
      <TableCell>
        {onViewUsers ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewUsers(tenant)}
            className="h-6 px-2"
          >
            <Users className="h-4 w-4 mr-1" />
            {t.pages.admin.tenants.viewUsers}
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
          {tenant.isActive
            ? t.pages.admin.tenants.active
            : t.pages.admin.tenants.inactive}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onManageFeatures && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManageFeatures(tenant)}
              className="h-8 w-8"
              title={t.pages.admin.tenants.manageFeatures}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(tenant)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tenant)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t.pages.admin.tenants.createTenant}
        </Button>
      </div>
      <DataTable
        data={tenants}
        columns={columns}
        renderRow={renderRow}
        defaultPageSize={paginationConfig.defaultPageSize}
        pageSizeOptions={paginationConfig.pageSizeOptions}
        paginationLabels={paginationConfig.paginationLabels}
      />
    </div>
  )
}

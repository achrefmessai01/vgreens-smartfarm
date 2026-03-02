'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
  onRowClick?: (tenant: Tenant) => void
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
            onClick={(e) => {
              e.stopPropagation()
              onViewUsers(tenant)
            }}
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
              onClick={(e) => {
                e.stopPropagation()
                onManageFeatures(tenant)
              }}
              className="h-8 w-8"
              title={t.pages.admin.tenants.manageFeatures}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(tenant)
            }}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(tenant)
            }}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  )

  const renderCard = (tenant: Tenant) => (
    <Card className="gap-0 overflow-hidden border border-border/60 py-0 shadow-none">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold">{tenant.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tenant.companyName || '-'}
            </p>
          </div>
          <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
            {tenant.isActive
              ? t.pages.admin.tenants.active
              : t.pages.admin.tenants.inactive}
          </Badge>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t.pages.admin.tenants.email}
            </dt>
            <dd className="mt-1 break-all text-sm">{tenant.email || '-'}</dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t.pages.admin.tenants.phone}
            </dt>
            <dd className="mt-1 text-sm">{tenant.phone || '-'}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex-wrap justify-end gap-2 border-t border-border/50 px-4 py-4">
        {onViewUsers && (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              onViewUsers(tenant)
            }}
            className="h-8"
          >
            <Users className="mr-1 h-4 w-4" />
            {t.pages.admin.tenants.viewUsers}
          </Button>
        )}
        {onManageFeatures && (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              onManageFeatures(tenant)
            }}
            className="h-8"
          >
            <Settings className="mr-1 h-4 w-4" />
            {t.pages.admin.tenants.manageFeatures}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(tenant)
          }}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(tenant)
          }}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
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
        renderCard={renderCard}
        onRowClick={onRowClick}
        paginationVariant="compact"
        defaultPageSize={paginationConfig.defaultPageSize}
        pageSizeOptions={paginationConfig.pageSizeOptions}
        paginationLabels={paginationConfig.paginationLabels}
        responsiveBreakpoint="xl"
      />
    </div>
  )
}

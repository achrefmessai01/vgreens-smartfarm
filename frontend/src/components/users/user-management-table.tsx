'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { User, UserRole, UserStatus } from '@/generated/graphql'
import { DataTable, type Column } from '@/components/ui/data-table'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface UserManagementTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onCreate: () => void
  isLoading?: boolean
  hideTenantColumn?: boolean // Hide tenant column for tenant users
}

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  hideTenantColumn = false,
}: UserManagementTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()

  const roleLabels: Record<UserRole, string> = {
    VGREENS_ADMIN: t.pages.admin.users.roleVgreensAdmin,
    TENANT_ADMIN: t.pages.admin.users.roleTenantAdmin,
    TENANT_USER: t.pages.admin.users.roleTenantUser,
  }

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
  ]

  const renderRow = (user: User) => {
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      t.pages.admin.users.notAvailable

    return (
      <>
        <TableCell className="font-medium">{fullName}</TableCell>
        <TableCell>{user.email || '-'}</TableCell>
        <TableCell>
          <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
        </TableCell>
        {!hideTenantColumn && <TableCell>{user.tenant?.name || '-'}</TableCell>}
        <TableCell>
          <Badge
            variant={
              user.status === UserStatus.Active
                ? 'default'
                : user.status === UserStatus.Pending
                ? 'outline'
                : 'secondary'
            }
          >
            {user.status === UserStatus.Pending
              ? t.pages.admin.users.pending
              : user.isActive
              ? t.pages.admin.users.active
              : t.pages.admin.users.inactive}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {t.pages.admin.users.createUser}
        </Button>
      </div>
      <DataTable
        data={users}
        columns={columns}
        renderRow={renderRow}
        defaultPageSize={paginationConfig.defaultPageSize}
        pageSizeOptions={paginationConfig.pageSizeOptions}
        paginationLabels={paginationConfig.paginationLabels}
      />
    </div>
  )
}

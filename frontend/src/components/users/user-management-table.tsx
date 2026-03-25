'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { TableCell } from '@/components/ui/table';
import { User, UserRole, UserStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface UserManagementTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean; // Hide tenant column for tenant users
}

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  hideTenantColumn = false,
}: UserManagementTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();

  const roleLabels: Record<UserRole, string> = {
    VGREENS_ADMIN: t.pages.admin.users.roleVgreensAdmin,
    TENANT_ADMIN: t.pages.admin.users.roleTenantAdmin,
    TENANT_USER: t.pages.admin.users.roleTenantUser,
  };

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

  const renderRow = (user: User) => {
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      t.pages.admin.users.notAvailable;

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
    );
  };

  const renderCard = (user: User) => {
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      t.pages.admin.users.notAvailable;

    return (
      <Card className="gap-2 overflow-hidden border py-2 shadow-none">
        {/* Custom-Header implementation - using card-header breaks ux */}
        <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
          <h3 className="text-sm font-semibold leading-none">{fullName}</h3>
          <Badge variant="outline" className="text-xs">
            {roleLabels[user.role] || user.role}
          </Badge>
        </div>

        <CardContent className="space-y-2 text-xs">
          {/* Email */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.admin.users.email}:
            </span>
            <span className="break-all font-medium">{user.email || '-'}</span>
          </div>

          {/* Tenant */}
          {!hideTenantColumn && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {t.pages.admin.users.tenant}:
              </span>
              <span className="font-medium">{user.tenant?.name || '-'}</span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.admin.users.status}:
            </span>
            <Badge
              variant={
                user.status === UserStatus.Active
                  ? 'default'
                  : user.status === UserStatus.Pending
                    ? 'outline'
                    : 'secondary'
              }
              className="h-5 text-xs"
            >
              {user.status === UserStatus.Pending
                ? t.pages.admin.users.pending
                : user.isActive
                  ? t.pages.admin.users.active
                  : t.pages.admin.users.inactive}
            </Badge>
          </div>
        </CardContent>

        {/* Custom-Footer implementation - using card-footer breaks ux */}
        <div className="flex items-center border-t px-6 pt-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex justify-end">
        <Button onClick={onCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {t.pages.admin.users.createUser}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <DataTable
          data={users}
          columns={columns}
          renderRow={renderRow}
          renderCard={renderCard}
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

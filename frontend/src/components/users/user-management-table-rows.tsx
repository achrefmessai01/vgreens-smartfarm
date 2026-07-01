import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { User, UserRole, UserStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { Edit2, Trash2 } from 'lucide-react';
import { useUserManagementCard } from './user-management-table-cards';

/**
 * Row rendering components for user management table
 */

interface UserManagementRowProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean;
  roleLabels: Record<UserRole, string>;
}

export const useUserManagementRow = ({
  onEdit,
  onDelete,
  isLoading = false,
  hideTenantColumn = false,
  roleLabels,
}: UserManagementRowProps) => {
  const { t } = useI18n();

  // Get card renderer from dedicated card module
  const { renderCard } = useUserManagementCard({
    onEdit,
    onDelete,
    isLoading,
    hideTenantColumn,
    roleLabels,
  });

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
            <WriteActionButton
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </WriteActionButton>
            <WriteActionButton
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
              className="text-destructive hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </WriteActionButton>
          </div>
        </TableCell>
      </>
    );
  };

  return { renderRow, renderCard };
};

import { TableCell } from '@/components/ui/table';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { User, UserRole } from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { UserAvatar } from './user-avatar';
import { UserGridCard } from './user-grid-card';
import { UserRolePill } from './user-role-pill';
import { UserStatusPill } from './user-status-pill';

interface UserRowTranslations {
  active: string;
  inactive: string;
  pending: string;
  edit: string;
  delete: string;
  noTenant: string;
  notAvailable: string;
}

interface UseUserManagementRowArgs {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean;
  roleLabels: Record<UserRole, string>;
  translations: UserRowTranslations;
}

/**
 * Row + card renderers for the users list view. Desktop renders the
 * redesigned USER / ROLE / TENANT / STATUS / ACTIONS shape; mobile drops
 * down to the shared `UserGridCard` so we don't duplicate card markup
 * between "list on narrow" and "grid view". Mirrors `useTenantRow`.
 */
export const useUserManagementRow = ({
  onEdit,
  onDelete,
  isLoading = false,
  hideTenantColumn = false,
  roleLabels,
  translations,
}: UseUserManagementRowArgs) => {
  const renderRow = (user: User) => {
    const isActive = user.isActive ?? true;
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      translations.notAvailable;

    return (
      <>
        <TableCell className="min-w-[240px] font-medium">
          <div className="flex items-center gap-3">
            <UserAvatar userId={user.id} name={fullName} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight">
                {fullName}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email || '-'}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <UserRolePill
            role={user.role}
            label={roleLabels[user.role] || user.role}
          />
        </TableCell>
        {!hideTenantColumn && (
          <TableCell className="min-w-[180px]">
            <span
              className={cn(
                'truncate text-sm',
                user.tenant?.name
                  ? 'text-foreground'
                  : 'text-muted-foreground/70 italic',
              )}
            >
              {user.tenant?.name || translations.noTenant}
            </span>
          </TableCell>
        )}
        <TableCell>
          <UserStatusPill
            status={user.status}
            isActive={isActive}
            translations={translations}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <WriteActionButton
              variant="ghost"
              size="icon"
              aria-label={translations.edit}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(user);
              }}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </WriteActionButton>
            <WriteActionButton
              variant="ghost"
              size="icon"
              aria-label={translations.delete}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(user);
              }}
              className="text-destructive hover:text-destructive h-8 w-8"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </WriteActionButton>
          </div>
        </TableCell>
      </>
    );
  };

  const renderCard = (user: User) => (
    <UserGridCard
      user={user}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      hideTenantColumn={hideTenantColumn}
      roleLabels={roleLabels}
      translations={translations}
    />
  );

  return { renderRow, renderCard };
};

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { User, UserRole } from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { Building2, Edit2, Trash2 } from 'lucide-react';
import { UserAvatar } from './user-avatar';
import { UserRolePill } from './user-role-pill';
import { UserStatusPill } from './user-status-pill';

interface UserGridCardTranslations {
  active: string;
  inactive: string;
  pending: string;
  edit: string;
  delete: string;
  noTenant: string;
  notAvailable: string;
}

interface UserGridCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onClick?: (user: User) => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean;
  roleLabels: Record<UserRole, string>;
  translations: UserGridCardTranslations;
}

/**
 * Single user card for the grid view. Presentational only — takes a user
 * + role label lookup + a small translation record + action callbacks,
 * renders the avatar + status + a single role/tenant row + footer
 * buttons. All state lives in the parent. Mirrors `TenantGridCard`.
 */
export function UserGridCard({
  user,
  onEdit,
  onDelete,
  onClick,
  isLoading = false,
  hideTenantColumn = false,
  roleLabels,
  translations,
}: UserGridCardProps) {
  const isActive = user.isActive ?? true;
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    translations.notAvailable;

  return (
    <Card
      onClick={onClick ? () => onClick(user) : undefined}
      className={cn(
        'border-border/60 flex flex-col gap-3 p-4 shadow-none transition-colors',
        onClick && 'hover:border-border cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <UserAvatar userId={user.id} name={fullName} size="md" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight">
              {fullName}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email || '-'}
            </span>
          </div>
        </div>
        <UserStatusPill
          status={user.status}
          isActive={isActive}
          translations={translations}
        />
      </div>

      <CardContent className="flex items-center gap-3 p-0 text-xs">
        <UserRolePill
          role={user.role}
          label={roleLabels[user.role] || user.role}
        />
        {!hideTenantColumn && (
          <div className="ml-auto flex min-w-0 items-center gap-1.5">
            <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <span
              className={cn(
                'truncate',
                user.tenant?.name
                  ? 'text-foreground'
                  : 'text-muted-foreground/70 italic',
              )}
            >
              {user.tenant?.name || translations.noTenant}
            </span>
          </div>
        )}
      </CardContent>

      <div className="border-border/60 flex items-center gap-1 border-t pt-3">
        <div className="ml-auto flex items-center gap-1">
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
      </div>
    </Card>
  );
}

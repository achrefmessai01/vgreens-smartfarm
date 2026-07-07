'use client';

import { TableEmptyState } from '@/components/ui/table-empty-state';
import { User, UserRole } from '@/generated/graphql';
import { UserGridCard } from './user-grid-card';

interface UserGridViewTranslations {
  active: string;
  inactive: string;
  pending: string;
  edit: string;
  delete: string;
  noTenant: string;
  notAvailable: string;
  noUsers: string;
  noUsersDescription: string;
}

interface UserGridViewProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCardClick?: (user: User) => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean;
  roleLabels: Record<UserRole, string>;
  translations: UserGridViewTranslations;
}

/**
 * Responsive card grid for the users view. Purely presentational — the
 * parent owns the users list (and any filtering/sorting applied before
 * we get here). Explicit breakpoints step from 1 → 2 → 3 columns to
 * match the tenants grid layout.
 */
export function UserGridView({
  users,
  onEdit,
  onDelete,
  onCardClick,
  isLoading = false,
  hideTenantColumn = false,
  roleLabels,
  translations,
}: UserGridViewProps) {
  if (users.length === 0) {
    return (
      <div className="border-border/60 flex min-h-[240px] items-center justify-center rounded-xl border">
        <TableEmptyState
          title={translations.noUsers}
          description={translations.noUsersDescription}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <UserGridCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onCardClick}
          isLoading={isLoading}
          hideTenantColumn={hideTenantColumn}
          roleLabels={roleLabels}
          translations={{
            active: translations.active,
            inactive: translations.inactive,
            pending: translations.pending,
            edit: translations.edit,
            delete: translations.delete,
            noTenant: translations.noTenant,
            notAvailable: translations.notAvailable,
          }}
        />
      ))}
    </div>
  );
}

'use client';

import { WriteActionButton } from '@/components/ui/write-action-button';
import { useI18n } from '@/i18n';
import type { UsersViewMode } from '@/lib/hooks/use-users-view-mode';
import { Plus } from 'lucide-react';
import { UserViewToggle } from './user-view-toggle';

interface UsersHeaderActionsProps {
  viewMode: UsersViewMode;
  onViewModeChange: (mode: UsersViewMode) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

/**
 * Right-aligned cluster in the users toolbar: view toggle + optional
 * "Create User" button. Extracted so the orchestrator stays focused on
 * composition and comfortably under the 150-line budget.
 */
export function UsersHeaderActions({
  viewMode,
  onViewModeChange,
  onCreate,
  isLoading = false,
}: UsersHeaderActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <UserViewToggle
        value={viewMode}
        onChange={onViewModeChange}
        labels={{
          list: t.pages.admin.users.viewList,
          grid: t.pages.admin.users.viewGrid,
        }}
      />
      {onCreate && (
        <WriteActionButton onClick={onCreate} disabled={isLoading}>
          <Plus className="h-4 w-4" />
          {t.pages.admin.users.createUser}
        </WriteActionButton>
      )}
    </div>
  );
}

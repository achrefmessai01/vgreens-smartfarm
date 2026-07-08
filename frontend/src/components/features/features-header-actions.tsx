'use client';

import { WriteActionButton } from '@/components/ui/write-action-button';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { useI18n } from '@/i18n';
import type { ListViewMode } from '@/lib/hooks/use-list-view-mode';
import { Plus } from 'lucide-react';

interface FeaturesHeaderActionsProps {
  viewMode: ListViewMode;
  onViewModeChange: (mode: ListViewMode) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

/**
 * Right-aligned cluster in the features toolbar: view toggle + optional
 * "Create Feature" button. Extracted so the orchestrator stays focused on
 * composition and comfortably under the 150-line budget. Mirrors
 * `UsersHeaderActions`.
 */
export function FeaturesHeaderActions({
  viewMode,
  onViewModeChange,
  onCreate,
  isLoading = false,
}: FeaturesHeaderActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <ViewModeToggle
        value={viewMode}
        onChange={onViewModeChange}
        labels={{
          list: t.pages.admin.features.viewList,
          grid: t.pages.admin.features.viewGrid,
        }}
      />
      {onCreate && (
        <WriteActionButton onClick={onCreate} disabled={isLoading}>
          <Plus className="h-4 w-4" />
          {t.pages.admin.features.createFeature}
        </WriteActionButton>
      )}
    </div>
  );
}

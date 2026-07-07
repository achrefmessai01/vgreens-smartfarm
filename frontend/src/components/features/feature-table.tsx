'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import { ListToolbar } from '@/components/ui/list-toolbar';
import type { Feature } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useFeatureTableFilters } from '@/lib/hooks/use-feature-table-filters';
import { useFeatureTableTranslations } from '@/lib/hooks/use-feature-table-translations';
import { useFeaturesViewMode } from '@/lib/hooks/use-features-view-mode';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { cn } from '@/lib/utils';
import { useFeatureTableColumns } from './feature-table-columns';
import { useFeatureTableRow } from './feature-table-rows';
import { FeatureGridView } from './feature-grid-view';
import { FeaturesHeaderActions } from './features-header-actions';

interface FeatureTableProps {
  features: Feature[];
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

/**
 * Feature-flags admin orchestrator. Owns the view-mode toggle (list ↔
 * grid) and renders a single shared toolbar (search + Category/Status
 * filter + view toggle + optional Create button) above the active
 * surface, then delegates to either `DataTable` (list) or
 * `FeatureGridView` (grid). All state lives in hooks so this component
 * stays purely compositional. Mirrors `UserManagementTable`.
 */
export function FeatureTable({
  features,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
}: FeatureTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const { viewMode, setViewMode } = useFeaturesViewMode();
  const {
    filteredFeatures,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  } = useFeatureTableFilters({ features });
  const { columnLabels, rowTranslations, gridTranslations } =
    useFeatureTableTranslations();

  const { renderRow, renderCard } = useFeatureTableRow({
    onEdit,
    onDelete,
    isLoading,
    translations: rowTranslations,
  });

  const columns = useFeatureTableColumns({
    sortDirection,
    toggleSort,
    labels: columnLabels,
  });

  return (
    <div
      className={cn(
        isMobile ? 'flex flex-col gap-2' : 'flex h-full min-h-0 flex-col gap-2',
      )}
    >
      <ListToolbar
        searchPlaceholder={t.pages.admin.features.searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterConfigs={filterConfigs}
        clearLabel={t.common.clear}
        headerActions={
          <FeaturesHeaderActions
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={onCreate}
            isLoading={isLoading}
          />
        }
      />
      {viewMode === 'grid' ? (
        <div
          className={
            isMobile ? '' : 'scrollbar-hide min-h-0 flex-1 overflow-y-auto pr-1'
          }
        >
          <FeatureGridView
            features={filteredFeatures}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            translations={gridTranslations}
          />
        </div>
      ) : (
        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <DataTable
            data={filteredFeatures}
            columns={columns}
            renderRow={renderRow}
            renderCard={renderCard}
            emptyState={{
              title: t.pages.admin.features.noResults,
              description: t.pages.admin.features.noResultsDescription,
            }}
            paginationVariant="compact"
            defaultPageSize={paginationConfig.defaultPageSize}
            pageSizeOptions={paginationConfig.pageSizeOptions}
            paginationLabels={paginationConfig.paginationLabels}
            responsiveBreakpoint="xl"
          />
        </div>
      )}
    </div>
  );
}

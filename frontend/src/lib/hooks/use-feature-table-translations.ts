'use client';

import { useI18n } from '@/i18n';

/**
 * Shared translation records used by the feature-flags list row, grid
 * card, empty state, and column headers. Pulled out so the
 * `FeatureTable` orchestrator stays under the 150-line budget and the
 * two consumers (row + grid) can't drift out of sync.
 */
export function useFeatureTableTranslations() {
  const { t } = useI18n();
  const labels = t.pages.admin.features;

  const columnLabels = {
    flag: labels.flag,
    category: labels.category,
    description: labels.description,
    status: labels.status,
    actions: labels.actions,
  };

  const rowTranslations = {
    active: labels.active,
    inactive: labels.inactive,
    edit: labels.editFeature,
    delete: labels.deleteFeature,
    noDescription: labels.noDescription,
    uncategorized: labels.uncategorized,
  };

  const gridTranslations = {
    ...rowTranslations,
    noResults: labels.noResults,
    noResultsDescription: labels.noResultsDescription,
  };

  return { columnLabels, rowTranslations, gridTranslations };
}

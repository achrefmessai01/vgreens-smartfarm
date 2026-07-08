'use client';

import * as React from 'react';
import type { Feature } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import type { FilterConfigOption } from '@/components/ui/data-table';

/**
 * Sentinel category id used to select rows that have no category set.
 * Keeps the value stable across renders and safe against real free-form
 * category strings the admin might type.
 */
const UNCATEGORIZED = '__uncategorized__';

const STATUS_VALUES = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type FeatureSortDirection = 'asc' | 'desc';

interface UseFeatureTableFiltersArgs {
  features: Feature[];
}

/**
 * Search + Category + Status filter + name-sort state for the Feature
 * Flags admin table. Category options are built dynamically from the
 * distinct `feature.category` values present in the data (plus a sentinel
 * "Uncategorized" option) — the feature form currently accepts free-form
 * category strings, so we can't hard-code a fixed enum.
 *
 * All work is client-side: the underlying query already returns the full
 * feature list, so an in-memory pass is the cheapest path and avoids a
 * network round-trip per keystroke. Mirrors `useUserTableFilters`.
 */
export function useFeatureTableFilters({ features }: UseFeatureTableFiltersArgs) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sortDirection, setSortDirection] =
    React.useState<FeatureSortDirection>('asc');

  const toggleSort = React.useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const distinctCategories = React.useMemo(() => {
    const set = new Set<string>();
    for (const f of features) {
      const trimmed = (f.category ?? '').trim();
      if (trimmed) set.add(trimmed);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [features]);

  const filteredFeatures = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const categories = categoryFilter
      ? categoryFilter.split(',').filter(Boolean)
      : [];
    const statuses = statusFilter
      ? statusFilter.split(',').filter(Boolean)
      : [];

    const filtered = features.filter((feature) => {
      if (query) {
        const haystack = [
          feature.name,
          feature.key,
          feature.description ?? '',
          feature.category ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (categories.length) {
        const cat = (feature.category ?? '').trim();
        const bucket = cat === '' ? UNCATEGORIZED : cat;
        if (!categories.includes(bucket)) return false;
      }
      if (statuses.length) {
        const matchesActive =
          statuses.includes(STATUS_VALUES.active) && feature.isActive;
        const matchesInactive =
          statuses.includes(STATUS_VALUES.inactive) && !feature.isActive;
        if (!matchesActive && !matchesInactive) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [features, searchQuery, categoryFilter, statusFilter, sortDirection]);

  const filterConfigs: FilterConfigOption[] = React.useMemo(() => {
    return [
      {
        label: t.pages.admin.features.category,
        value: categoryFilter,
        multiSelect: true,
        onFilterChange: setCategoryFilter,
        options: [
          ...distinctCategories.map((cat) => ({ label: cat, value: cat })),
          {
            label: t.pages.admin.features.uncategorized,
            value: UNCATEGORIZED,
          },
        ],
      },
      {
        label: t.pages.admin.features.status,
        value: statusFilter,
        multiSelect: true,
        onFilterChange: setStatusFilter,
        options: [
          {
            label: t.pages.admin.features.active,
            value: STATUS_VALUES.active,
          },
          {
            label: t.pages.admin.features.inactive,
            value: STATUS_VALUES.inactive,
          },
        ],
      },
    ];
  }, [
    t.pages.admin.features.category,
    t.pages.admin.features.uncategorized,
    t.pages.admin.features.status,
    t.pages.admin.features.active,
    t.pages.admin.features.inactive,
    categoryFilter,
    statusFilter,
    distinctCategories,
  ]);

  return {
    filteredFeatures,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  };
}

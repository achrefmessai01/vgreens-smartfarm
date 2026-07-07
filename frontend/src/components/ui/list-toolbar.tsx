'use client';

import type { FilterChip } from '@/components/ui/table-filter-chips';
import { TableFilterChips } from '@/components/ui/table-filter-chips';
import type { TableFilterConfig } from '@/components/ui/table-filter-popover';
import { TableFiltersPopover } from '@/components/ui/table-filters-popover';
import { TableSearch } from '@/components/ui/table-search';
import { X } from 'lucide-react';
import * as React from 'react';

interface ListToolbarProps {
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterConfigs: TableFilterConfig[];
  /** Localized "Clear" label for the reset button next to the popover. */
  clearLabel: string;
  /** Right-aligned actions (view-mode toggle, Create button, etc.). */
  headerActions?: React.ReactNode;
}

/**
 * Generic search + filter + header-actions toolbar rendered above BOTH
 * views (list + grid) of an admin list surface. Consolidates the shape
 * that was previously duplicated across `TenantsToolbar` + `UsersToolbar`
 * so new admin tables (feature flags, future surfaces) can drop straight
 * in.
 */
export function ListToolbar({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  filterConfigs,
  clearLabel,
  headerActions,
}: ListToolbarProps) {
  const filterChips: FilterChip[] = React.useMemo(() => {
    return filterConfigs
      .filter((fc) => (fc.multiSelect ? fc.value !== '' : false))
      .map((fc) => {
        const valueLabel = fc.value
          .split(',')
          .map(
            (value) =>
              fc.options.find((option) => option.value === value)?.label ??
              value,
          )
          .filter(Boolean)
          .join(', ');
        return {
          id: fc.label,
          label: fc.label,
          valueLabel,
          onRemove: () => fc.onFilterChange(''),
        };
      });
  }, [filterConfigs]);

  const clearAllFilters = () =>
    filterConfigs.forEach((fc) =>
      fc.onFilterChange(fc.multiSelect ? '' : (fc.options[0]?.value ?? '')),
    );

  const showClear = filterChips.length > 0;

  return (
    <div className="px-1 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full sm:w-auto">
          <TableSearch
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TableFiltersPopover
            categories={filterConfigs}
            onClearAll={clearAllFilters}
          />
          {showClear && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
            >
              <X className="h-3.5 w-3.5" />
              {clearLabel}
            </button>
          )}
        </div>
        {headerActions && (
          <div className="shrink-0 sm:ml-auto">{headerActions}</div>
        )}
      </div>
      {filterChips.length > 0 && (
        <TableFilterChips chips={filterChips} className="mt-3" />
      )}
    </div>
  );
}

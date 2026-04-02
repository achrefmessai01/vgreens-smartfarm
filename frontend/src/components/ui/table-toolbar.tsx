'use client';

import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { FilterChip } from '@/components/ui/table-filter-chips';
import { TableFilterChips } from '@/components/ui/table-filter-chips';
import type { TableFilterConfig } from '@/components/ui/table-filter-popover';
import { TableFilterPopover } from '@/components/ui/table-filter-popover';
import { TableFiltersPopover } from '@/components/ui/table-filters-popover';
import { TableSearch } from '@/components/ui/table-search';
import { X } from 'lucide-react';

export interface DateRangeConfig {
  dateFrom: Date | null;
  dateTo: Date | null;
  onRangeChange: (from: Date | null, to: Date | null) => void;
  placeholder?: string;
}

export interface TableToolbarProps {
  searchConfig?: { placeholder: string };
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterConfig?: TableFilterConfig;
  filterConfigs?: TableFilterConfig[];
  dateRangeConfig?: DateRangeConfig;
  clearFilter: () => void;
  clearAllFilters?: () => void;
  hasActiveFilter: boolean;
  filterChips: FilterChip[];
  headerActions?: React.ReactNode;
}

export function TableToolbar({
  searchConfig,
  searchQuery,
  onSearchChange,
  filterConfig,
  filterConfigs,
  dateRangeConfig,
  clearFilter,
  clearAllFilters,
  hasActiveFilter,
  filterChips,
  headerActions,
}: TableToolbarProps) {
  const hasMultipleFilters = filterConfigs && filterConfigs.length > 0;
  const hasSingleFilter = filterConfig && !hasMultipleFilters;
  const showClear =
    (hasSingleFilter && hasActiveFilter) ||
    (hasMultipleFilters && filterChips.length > 0 && clearAllFilters);

  return (
    <div className="px-1 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Search on its own row on mobile, inline on desktop */}
        {searchConfig && (
          <div className="w-full sm:w-auto">
            <TableSearch
              placeholder={searchConfig.placeholder}
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
        )}

        {/* Filters and date picker on same row */}
        <div className="flex flex-wrap items-center gap-2">
          {hasMultipleFilters ? (
            <>
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
                  Clear
                </button>
              )}
            </>
          ) : hasSingleFilter ? (
            <>
              <TableFilterPopover
                filterConfig={filterConfig}
                onClear={clearFilter}
              />
              {showClear && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </>
          ) : null}
          {dateRangeConfig && (
            <DateRangePicker
              dateFrom={dateRangeConfig.dateFrom}
              dateTo={dateRangeConfig.dateTo}
              onRangeChange={dateRangeConfig.onRangeChange}
              placeholder={dateRangeConfig.placeholder}
            />
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

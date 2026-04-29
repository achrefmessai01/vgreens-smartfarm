'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DataTableCardView } from '@/components/ui/data-table/data-table-card-view';
import { DataTableTableView } from '@/components/ui/data-table/data-table-table-view';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { TablePagination } from '@/components/ui/table-pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import * as React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DateRangeConfig {
  dateFrom: Date | null;
  dateTo: Date | null;
  onRangeChange: (from: Date | null, to: Date | null) => void;
  placeholder?: string;
}

export interface FilterConfigOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
  multiSelect?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderRow: (item: T) => React.ReactNode;
  renderCard?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  searchConfig?: {
    placeholder: string;
    onSearch?: (query: string, item: T) => boolean;
  };
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /**
   * Optional commit handler. When set, the search input fires this on Enter
   * or blur (in addition to onSearchChange firing on every keystroke). Use
   * this when committing the search triggers an expensive network refetch.
   */
  onSearchCommit?: (value: string) => void;
  filterConfig?: FilterConfigOption;
  filterConfigs?: FilterConfigOption[];
  dateRangeConfig?: DateRangeConfig;
  headerActions?: React.ReactNode;
  emptyState?: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  paginationLabels?: {
    showing: string;
    of: string;
    results: string;
    perPage: string;
    previous: string;
    next: string;
  };
  paginationVariant?: 'default' | 'compact';
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  responsiveBreakpoint?: 'md' | 'lg' | 'xl' | '2xl';
  responsiveMode?: 'viewport' | 'container';
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  renderRow,
  renderCard,
  onRowClick,
  searchConfig,
  searchValue,
  onSearchChange,
  onSearchCommit,
  filterConfig,
  filterConfigs,
  dateRangeConfig,
  headerActions,
  emptyState,
  paginationLabels,
  paginationVariant = 'default',
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  isLoading = false,
  responsiveBreakpoint = 'md',
  responsiveMode = 'viewport',
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [responsiveContainer, setResponsiveContainer] =
    React.useState<HTMLDivElement | null>(null);

  // Determine which view to show based on screen size and card availability
  const hasCardView = !!renderCard;
  const { isMobile, isInitialized } = useResponsiveBreakpoint(
    responsiveBreakpoint,
    responsiveMode === 'container' ? responsiveContainer : null,
  );
  const showCardView = hasCardView && isMobile;
  const showTableView = !hasCardView || !isMobile;

  const isSearchControlled =
    searchValue !== undefined && onSearchChange !== undefined;
  const searchQuery = isSearchControlled ? (searchValue ?? '') : internalSearch;
  const setSearchQuery = isSearchControlled
    ? onSearchChange
    : setInternalSearch;

  const searchedData = React.useMemo(() => {
    if (!searchConfig) return data;
    if (!searchQuery.trim()) return data;
    if (isSearchControlled || !searchConfig.onSearch) return data;
    return data.filter((item) => searchConfig.onSearch!(searchQuery, item));
  }, [data, isSearchControlled, searchConfig, searchQuery]);

  const filteredData = searchedData;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig?.value, filterConfigs, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const hasToolbar =
    searchConfig ||
    filterConfig ||
    (filterConfigs && filterConfigs.length > 0) ||
    dateRangeConfig ||
    headerActions;

  const firstOpt = filterConfig?.options[0]?.value ?? '';
  const hasActiveFilter =
    filterConfig &&
    filterConfig.value !== '' &&
    filterConfig.value !== firstOpt;
  const clearFilter = () => filterConfig?.onFilterChange(firstOpt);

  const filterChips = React.useMemo(() => {
    const configs = filterConfigs ?? (filterConfig ? [filterConfig] : []);

    return configs
      .filter((fc) => {
        if (fc.multiSelect) return fc.value !== '';
        const first = fc.options[0]?.value ?? '';
        return fc.value !== '' && fc.value !== first;
      })
      .map((fc) => {
        const valueLabel =
          fc.multiSelect && fc.value
            ? fc.value
                .split(',')
                .map((value) => {
                  return (
                    fc.options.find((option) => option.value === value)
                      ?.label ?? value
                  );
                })
                .filter(Boolean)
                .join(', ')
            : (fc.options.find((option) => option.value === fc.value)?.label ??
              fc.value);

        return {
          id: fc.label,
          label: fc.label,
          valueLabel,
          onRemove: () =>
            fc.onFilterChange(
              fc.multiSelect ? '' : (fc.options[0]?.value ?? ''),
            ),
        };
      });
  }, [filterConfig, filterConfigs]);

  const clearAllFilters = () => {
    (filterConfigs ?? (filterConfig ? [filterConfig] : [])).forEach((fc) => {
      fc.onFilterChange(fc.multiSelect ? '' : (fc.options[0]?.value ?? ''));
    });
  };

  return (
    <div
      ref={setResponsiveContainer}
      className={
        showCardView
          ? 'flex w-full min-w-0 flex-col' // Mobile: grow naturally
          : 'flex h-full min-h-0 w-full min-w-0 flex-col' // Desktop: constrained
      }
    >
      {hasToolbar && (
        <TableToolbar
          searchConfig={
            searchConfig ? { placeholder: searchConfig.placeholder } : undefined
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchCommit={onSearchCommit}
          filterConfig={filterConfig}
          filterConfigs={filterConfigs}
          dateRangeConfig={dateRangeConfig}
          clearFilter={clearFilter}
          clearAllFilters={filterChips.length > 0 ? clearAllFilters : undefined}
          hasActiveFilter={!!hasActiveFilter}
          filterChips={filterChips}
          headerActions={headerActions}
        />
      )}

      <Card
        className={
          showCardView
            ? 'border-border/60 flex flex-col rounded-xl border shadow-sm' // Mobile: grow naturally
            : 'border-border/60 flex min-h-0 flex-1 flex-col rounded-xl border shadow-sm' // Desktop: constrained height
        }
      >
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          {isLoading ? (
            <TableSkeleton
              columnCount={columns.length}
              rowCount={8}
              showHeader
              className="rounded-none border-0"
            />
          ) : filteredData.length === 0 && emptyState ? (
            <TableEmptyState
              title={emptyState.title}
              description={emptyState.description}
              action={emptyState.action}
            />
          ) : filteredData.length > 0 ? (
            <>
              {/* Show loading state on initial render before breakpoint is determined */}
              {hasCardView && !isInitialized ? (
                <TableSkeleton
                  columnCount={columns.length}
                  rowCount={Math.min(paginatedData.length, 5)}
                  showHeader={false}
                  className="rounded-none border-0"
                />
              ) : (
                <div
                  className={
                    showCardView
                      ? 'flex-1' // Mobile: no overflow, let content grow naturally
                      : 'min-h-0 flex-1 overflow-y-auto' // Desktop: fixed height with scroll
                  }
                >
                  {/* Render card view on mobile when available */}
                  {showCardView && renderCard && (
                    <DataTableCardView
                      data={paginatedData}
                      renderCard={renderCard}
                      onRowClick={onRowClick}
                    />
                  )}

                  {/* Render table view on desktop or when no card view */}
                  {showTableView && (
                    <DataTableTableView
                      data={paginatedData}
                      columns={columns}
                      renderRow={renderRow}
                      onRowClick={onRowClick}
                    />
                  )}
                </div>
              )}

              <TablePagination
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredData.length}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                labels={paginationLabels}
                variant={paginationVariant}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

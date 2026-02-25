'use client'

import * as React from 'react'
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TableToolbar } from '@/components/ui/table-toolbar'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableEmptyState } from '@/components/ui/table-empty-state'
import { TableSkeleton } from '@/components/ui/table-skeleton'

export interface Column<T> {
  key: string
  header: string
  accessor?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DateRangeConfig {
  dateFrom: Date | null
  dateTo: Date | null
  onRangeChange: (from: Date | null, to: Date | null) => void
  placeholder?: string
}

export interface FilterConfigOption {
  label: string
  value: string
  options: { label: string; value: string }[]
  onFilterChange: (value: string) => void
  /** When true, value is comma-separated and category shows checkboxes for multi-select */
  multiSelect?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  renderRow: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
  searchConfig?: {
    placeholder: string
    onSearch?: (query: string, item: T) => boolean
  }
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterConfig?: FilterConfigOption
  filterConfigs?: FilterConfigOption[]
  dateRangeConfig?: DateRangeConfig
  headerActions?: React.ReactNode
  emptyState?: {
    title: string
    description?: string
    action?: React.ReactNode
  }
  paginationLabels?: {
    showing: string
    of: string
    results: string
    perPage: string
    previous: string
    next: string
  }
  defaultPageSize?: number
  pageSizeOptions?: number[]
  isLoading?: boolean
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  renderRow,
  onRowClick,
  searchConfig,
  searchValue,
  onSearchChange,
  filterConfig,
  filterConfigs,
  dateRangeConfig,
  headerActions,
  emptyState,
  paginationLabels,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  isLoading = false,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  const isSearchControlled =
    searchValue !== undefined && onSearchChange !== undefined
  const searchQuery = isSearchControlled ? (searchValue ?? '') : internalSearch
  const setSearchQuery = isSearchControlled ? onSearchChange : setInternalSearch

  const searchedData = React.useMemo(() => {
    if (!searchConfig) return data
    if (!searchQuery.trim()) return data
    if (isSearchControlled || !searchConfig.onSearch) return data
    return data.filter((item) => searchConfig.onSearch!(searchQuery, item))
  }, [data, searchQuery, searchConfig, isSearchControlled])

  const filteredData = searchedData

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterConfig?.value, filterConfigs])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const hasToolbar =
    searchConfig ||
    filterConfig ||
    (filterConfigs && filterConfigs.length > 0) ||
    dateRangeConfig ||
    headerActions
  const firstOpt = filterConfig?.options[0]?.value ?? ''
  const hasActiveFilter =
    filterConfig && filterConfig.value !== '' && filterConfig.value !== firstOpt
  const clearFilter = () => filterConfig?.onFilterChange(firstOpt)

  const filterChips = React.useMemo(() => {
    const configs = filterConfigs ?? (filterConfig ? [filterConfig] : [])
    return configs
      .filter((fc) => {
        if (fc.multiSelect) return fc.value !== ''
        const first = fc.options[0]?.value ?? ''
        return fc.value !== '' && fc.value !== first
      })
      .map((fc) => {
        const valueLabel =
          fc.multiSelect && fc.value
            ? fc.value
                .split(',')
                .map((v) => fc.options.find((o) => o.value === v)?.label ?? v)
                .filter(Boolean)
                .join(', ')
            : (fc.options.find((o) => o.value === fc.value)?.label ?? fc.value)
        return {
          id: fc.label,
          label: fc.label,
          valueLabel,
          onRemove: () =>
            fc.onFilterChange(
              fc.multiSelect ? '' : (fc.options[0]?.value ?? ''),
            ),
        }
      })
  }, [filterConfig, filterConfigs])

  const clearAllFilters = () => {
    ;(filterConfigs ?? (filterConfig ? [filterConfig] : [])).forEach((fc) => {
      fc.onFilterChange(fc.multiSelect ? '' : (fc.options[0]?.value ?? ''))
    })
  }

  return (
    <div className="w-full overflow-auto">
      {hasToolbar && (
        <TableToolbar
          searchConfig={
            searchConfig ? { placeholder: searchConfig.placeholder } : undefined
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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

      <Card className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <CardContent className="p-0">
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
              <div className="overflow-x-auto">
                <Table className="[&_td]:px-4 [&_td]:py-3">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 hover:bg-transparent bg-muted/20">
                      {columns.map((col) => (
                        <TableHead
                          key={col.key}
                          className={cn(
                            'h-11 px-4 font-semibold text-foreground tracking-tight',
                            col.headerClassName,
                          )}
                        >
                          {col.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          'border-b border-border/40 transition-colors',
                          onRowClick &&
                            'cursor-pointer hover:bg-muted/40 active:bg-muted/50',
                        )}
                        onClick={
                          onRowClick ? () => onRowClick(item) : undefined
                        }
                      >
                        {renderRow(item)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

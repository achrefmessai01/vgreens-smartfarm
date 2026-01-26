'use client'

import * as React from 'react'
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { StyledSelect } from '@/components/ui/styled-select'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  accessor?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  renderRow: (item: T) => React.ReactNode
  searchConfig?: {
    placeholder: string
    onSearch: (query: string, item: T) => boolean
  }
  filterConfig?: {
    label: string
    value: string
    options: { label: string; value: string }[]
    onFilterChange: (value: string) => void
  }
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
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  renderRow,
  searchConfig,
  filterConfig,
  headerActions,
  emptyState,
  paginationLabels,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  // Apply search filter
  const searchedData = React.useMemo(() => {
    if (!searchConfig || !searchQuery.trim()) {
      return data
    }
    return data.filter((item) => searchConfig.onSearch(searchQuery, item))
  }, [data, searchQuery, searchConfig])

  // Filtered data (parent component handles custom filtering logic)
  const filteredData = searchedData

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterConfig?.value])

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setCurrentPage(1)
  }

  const showingLabel = paginationLabels?.showing || 'Showing'
  const ofLabel = paginationLabels?.of || 'of'
  const resultsLabel = paginationLabels?.results || 'results'
  const perPageLabel = paginationLabels?.perPage || 'per page'
  const previousLabel = paginationLabels?.previous || 'Previous'
  const nextLabel = paginationLabels?.next || 'Next'

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 dark:border-border/50">
      <CardContent className="pt-6">
        {/* Header with Search, Filter, and Actions */}
        {(searchConfig || filterConfig || headerActions) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchConfig && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                <Input
                  type="text"
                  placeholder={searchConfig.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 dark:border-border/50  dark:text-white dark:placeholder:text-white"
                />
              </div>
            )}

            {filterConfig && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground dark:text-white whitespace-nowrap">
                  {filterConfig.label}:
                </span>
                <StyledSelect
                  value={filterConfig.value}
                  onValueChange={filterConfig.onFilterChange}
                  options={filterConfig.options}
                  width="180px"
                />
              </div>
            )}

            {headerActions && <div className="sm:w-auto">{headerActions}</div>}
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 ? (
          emptyState ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground dark:text-gray-300 font-medium mb-2">
                {emptyState.title}
              </p>
              {emptyState.description && (
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                  {emptyState.description}
                </p>
              )}
              {emptyState.action && <div>{emptyState.action}</div>}
            </div>
          ) : null
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-border/50 dark:hover:bg-transparent">
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={cn(
                          'dark:text-white dark:font-semibold',
                          column.headerClassName
                        )}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="dark:border-border/30 dark:hover:bg-muted/50"
                    >
                      {renderRow(item)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t dark:border-border/50 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                  <span>
                    {showingLabel} {startIndex + 1}-
                    {Math.min(endIndex, filteredData.length)} {ofLabel}{' '}
                    {filteredData.length} {resultsLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground dark:text-gray-400 whitespace-nowrap">
                      {perPageLabel}:
                    </span>
                    <StyledSelect
                      value={pageSize.toString()}
                      onValueChange={handlePageSizeChange}
                      options={pageSizeOptions.map((size) => ({
                        label: size.toString(),
                        value: size.toString(),
                      }))}
                      width="70px"
                      triggerClassName="h-8"
                    />
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">{previousLabel}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            if (totalPages <= 7) return true
                            if (page === 1 || page === totalPages) return true
                            if (Math.abs(page - currentPage) <= 1) return true
                            return false
                          })
                          .map((page, index, array) => {
                            const showEllipsisBefore =
                              index > 0 && array[index - 1] !== page - 1
                            return (
                              <React.Fragment key={page}>
                                {showEllipsisBefore && (
                                  <span className="px-2 text-muted-foreground dark:text-gray-500">
                                    ...
                                  </span>
                                )}
                                <Button
                                  variant={
                                    currentPage === page ? 'default' : 'outline'
                                  }
                                  size="icon"
                                  onClick={() => handlePageChange(page)}
                                  className="h-8 w-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70 dark:data-[state=on]:bg-primary dark:data-[state=on]:text-primary-foreground"
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            )
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">{nextLabel}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

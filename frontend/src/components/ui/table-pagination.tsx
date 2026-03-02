'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { cn } from '@/lib/utils'

export interface TablePaginationProps {
  startIndex: number
  endIndex: number
  totalItems: number
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  labels?: Partial<{
    showing: string
    of: string
    results: string
    perPage: string
    previous: string
    next: string
  }>
  variant?: 'default' | 'compact'
  className?: string
}

export function TablePagination({
  startIndex,
  endIndex,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  labels = {},
  variant = 'default',
  className,
}: TablePaginationProps) {
  const showing = labels.showing ?? 'Showing'
  const ofLabel = labels.of ?? 'of'
  const results = labels.results ?? 'results'
  const perPage = labels.perPage ?? 'per page'
  const previous = labels.previous ?? 'Previous'
  const next = labels.next ?? 'Next'
  const isCompact = variant === 'compact'
  const safeTotalPages = Math.max(totalPages, 1)

  const pageNumbers = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const set = new Set<number>([1, totalPages])
    set.add(currentPage)
    if (currentPage > 1) set.add(currentPage - 1)
    if (currentPage < totalPages) set.add(currentPage + 1)

    return Array.from(set).sort((a, b) => a - b)
  }, [currentPage, totalPages])

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5',
        className,
      )}
    >
      <p className="order-2 text-sm text-muted-foreground sm:order-1">
        {showing}{' '}
        <span className="font-medium text-foreground">
          {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)}
        </span>{' '}
        {ofLabel}{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        {results}
      </p>

      <div className="order-1 flex flex-col gap-3 sm:order-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {perPage}
          </span>
          <StyledSelect
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map((size) => ({
              label: size.toString(),
              value: size.toString(),
            }))}
            width="72px"
            triggerClassName="h-8 rounded-md"
          />
        </div>

        {totalPages > 1 && (
          <>
            {isCompact ? (
              <nav
                className="flex w-full items-center justify-between gap-3 sm:hidden"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">{previous}</span>
                </Button>

                <span
                  className="min-w-0 text-center text-sm font-medium text-foreground"
                  aria-live="polite"
                >
                  {currentPage} / {safeTotalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-md"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">{next}</span>
                </Button>
              </nav>
            ) : null}

            <nav
              className={cn(
                'items-center gap-0.5',
                isCompact ? 'hidden sm:flex' : 'flex',
              )}
              aria-label="Pagination"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-md"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">{previous}</span>
              </Button>

              {pageNumbers.map((page, index) => {
                const showEllipsisBefore =
                  index > 0 && pageNumbers[index - 1] !== page - 1

                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span
                        className="flex w-8 items-center justify-center text-sm text-muted-foreground"
                        aria-hidden
                      >
                        ...
                      </span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => onPageChange(page)}
                      className="h-8 w-8 min-w-8 rounded-md"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-md"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">{next}</span>
              </Button>
            </nav>
          </>
        )}
      </div>
    </div>
  )
}

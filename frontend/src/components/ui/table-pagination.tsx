'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  labels?: {
    showing: string
    of: string
    results: string
    perPage: string
    previous: string
    next: string
  }
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
  className,
}: TablePaginationProps) {
  const showing = labels.showing ?? 'Showing'
  const ofLabel = labels.of ?? 'of'
  const results = labels.results ?? 'results'
  const perPage = labels.perPage ?? 'per page'
  const previous = labels.previous ?? 'Previous'
  const next = labels.next ?? 'Next'

  const pageNumbers = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const set = new Set<number>([1, totalPages])
    set.add(currentPage)
    if (currentPage > 1) set.add(currentPage - 1)
    if (currentPage < totalPages) set.add(currentPage + 1)
    return Array.from(set).sort((a, b) => a - b)
  }, [totalPages, currentPage])

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 bg-muted/20 border-t border-border/60',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        {showing}{' '}
        <span className="font-medium text-foreground">
          {startIndex + 1}–{Math.min(endIndex, totalItems)}
        </span>{' '}
        {ofLabel}{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        {results}
      </p>

      <div className="flex items-center gap-4 order-1 sm:order-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {perPage}
          </span>
          <StyledSelect
            value={pageSize.toString()}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map((size) => ({
              label: size.toString(),
              value: size.toString(),
            }))}
            width="72px"
            triggerClassName="h-8 rounded-md"
          />
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center gap-0.5" aria-label="Pagination">
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
                      className="w-8 flex items-center justify-center text-muted-foreground text-sm"
                      aria-hidden
                    >
                      …
                    </span>
                  )}
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onPageChange(page)}
                    className="h-8 w-8 rounded-md min-w-8"
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
        )}
      </div>
    </div>
  )
}

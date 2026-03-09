'use client'

import * as React from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

export function usePagination({
  totalItems,
  itemsPerPage = 15,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = React.useState(initialPage)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const goToNext = React.useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const goToPrevious = React.useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const getPageItems = React.useCallback(
    <T>(items: T[]) => {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return items.slice(startIndex, endIndex)
    },
    [currentPage, itemsPerPage]
  )

  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNext,
    goToPrevious,
    getPageItems,
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
  }
}
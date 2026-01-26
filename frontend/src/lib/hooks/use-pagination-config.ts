'use client'

import { useI18n } from '@/i18n'
import {
  type PaginationConfig,
  DEFAULT_PAGINATION_CONFIG,
} from '@/lib/config/pagination.config'

export function usePaginationConfig(options?: {
  defaultPageSize?: number
  pageSizeOptions?: number[]
}): PaginationConfig {
  const { t } = useI18n()

  const paginationLabels = {
    showing:
      t.pages?.users?.showing ??
      DEFAULT_PAGINATION_CONFIG.paginationLabels.showing,
    of: t.pages?.users?.of ?? DEFAULT_PAGINATION_CONFIG.paginationLabels.of,
    results:
      t.pages?.users?.results ??
      DEFAULT_PAGINATION_CONFIG.paginationLabels.results,
    perPage:
      t.pages?.users?.perPage ??
      DEFAULT_PAGINATION_CONFIG.paginationLabels.perPage,
    previous:
      t.pages?.users?.previous ??
      DEFAULT_PAGINATION_CONFIG.paginationLabels.previous,
    next:
      t.pages?.users?.next ?? DEFAULT_PAGINATION_CONFIG.paginationLabels.next,
  }

  return {
    defaultPageSize:
      options?.defaultPageSize ?? DEFAULT_PAGINATION_CONFIG.defaultPageSize,
    pageSizeOptions:
      options?.pageSizeOptions ?? DEFAULT_PAGINATION_CONFIG.pageSizeOptions,
    paginationLabels,
  }
}

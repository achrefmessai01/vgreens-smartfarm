/**
 * Generic pagination configuration for DataTable components
 * Use this across all pages that have tables for consistent pagination
 */

export interface PaginationConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  paginationLabels: {
    showing: string;
    of: string;
    results: string;
    perPage: string;
    previous: string;
    next: string;
  };
}

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  paginationLabels: {
    showing: 'Showing',
    of: 'of',
    results: 'results',
    perPage: 'per page',
    previous: 'Previous',
    next: 'Next',
  },
};

/**
 * Get pagination config with custom labels
 */
export function getPaginationConfig(
  labels?: Partial<PaginationConfig['paginationLabels']>,
  options?: {
    defaultPageSize?: number;
    pageSizeOptions?: number[];
  },
): PaginationConfig {
  return {
    defaultPageSize:
      options?.defaultPageSize ?? DEFAULT_PAGINATION_CONFIG.defaultPageSize,
    pageSizeOptions:
      options?.pageSizeOptions ?? DEFAULT_PAGINATION_CONFIG.pageSizeOptions,
    paginationLabels: {
      ...DEFAULT_PAGINATION_CONFIG.paginationLabels,
      ...labels,
    },
  };
}

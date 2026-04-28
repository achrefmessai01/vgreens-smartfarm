import { useMemo } from 'react';
import {
  useGetHarvestDashboardQuery,
  type HarvestDashboardMetrics,
} from '@/generated/graphql';
import { getDateRange, type DateFilter } from '@/lib/harvest-date-range';

export type { DateFilter };

export type HarvestDashboardData = Omit<HarvestDashboardMetrics, '__typename'>;

interface DashboardFilter {
  species?: string;
  variety?: string;
  batch?: string;
  dateFrom?: string;
  dateTo?: string;
  greenhouse?: string;
  dateFilter?: DateFilter;
}

export function useHarvestDashboard(filter?: DashboardFilter) {
  const dateRange = filter?.dateFilter
    ? getDateRange(filter.dateFilter)
    : { dateFrom: filter?.dateFrom, dateTo: filter?.dateTo };

  const queryFilter = filter
    ? {
        ...(filter.species && { species: filter.species }),
        ...(filter.variety && { variety: filter.variety }),
        ...(filter.batch && { batch: filter.batch }),
        ...(dateRange.dateFrom && { dateFrom: dateRange.dateFrom }),
        ...(dateRange.dateTo && { dateTo: dateRange.dateTo }),
        ...(filter.greenhouse && { greenhouse: filter.greenhouse }),
      }
    : undefined;

  const hasFilterValues = queryFilter && Object.keys(queryFilter).length > 0;

  const { data, loading, error, refetch } = useGetHarvestDashboardQuery({
    variables: { filter: hasFilterValues ? queryFilter : undefined },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  return useMemo(
    () => ({
      data: data?.harvestDashboard,
      loading,
      error,
      refetch,
    }),
    [data?.harvestDashboard, loading, error, refetch],
  );
}

import {
  useGetHarvestDashboardQuery,
  type HarvestDashboardMetrics,
} from '../../generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';

export type DateFilter =
  | 'today'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'total';

interface DashboardFilter {
  tenantId?: string;
  species?: string;
  variety?: string;
  batch?: string;
  batchId?: string;
  dateFrom?: string;
  dateTo?: string;
  greenhouseId?: string;
  dateFilter?: DateFilter;
}

export type HarvestDashboardData = Omit<HarvestDashboardMetrics, '__typename'>;

function getDateRange(filter: DateFilter): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();

  // Get today's date in YYYY-MM-DD format without timezone conversion issues
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayISO = `${year}-${month}-${day}`;

  switch (filter) {
    case 'today':
      return { dateFrom: todayISO, dateTo: todayISO };

    case 'thisWeek': {
      // Start of week (Monday)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - daysToSubtract);

      const startYear = startOfWeek.getFullYear();
      const startMonth = String(startOfWeek.getMonth() + 1).padStart(2, '0');
      const startDay = String(startOfWeek.getDate()).padStart(2, '0');
      const startOfWeekISO = `${startYear}-${startMonth}-${startDay}`;

      return {
        dateFrom: startOfWeekISO,
        dateTo: todayISO,
      };
    }

    case 'thisMonth': {
      const startOfMonth = new Date(year, now.getMonth(), 1);
      const startYear = startOfMonth.getFullYear();
      const startMonth = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const startDay = String(startOfMonth.getDate()).padStart(2, '0');
      const startOfMonthISO = `${startYear}-${startMonth}-${startDay}`;

      return {
        dateFrom: startOfMonthISO,
        dateTo: todayISO,
      };
    }

    case 'lastWeek': {
      // End of last week (Sunday)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // Sunday = 0

      const endOfLastWeek = new Date(today);
      endOfLastWeek.setDate(today.getDate() - daysToSubtract - 1);

      // Start of last week (Monday)
      const startOfLastWeek = new Date(endOfLastWeek);
      startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);

      const startYear = startOfLastWeek.getFullYear();
      const startMonth = String(startOfLastWeek.getMonth() + 1).padStart(
        2,
        '0',
      );
      const startDay = String(startOfLastWeek.getDate()).padStart(2, '0');
      const startOfLastWeekISO = `${startYear}-${startMonth}-${startDay}`;

      const endYear = endOfLastWeek.getFullYear();
      const endMonth = String(endOfLastWeek.getMonth() + 1).padStart(2, '0');
      const endDay = String(endOfLastWeek.getDate()).padStart(2, '0');
      const endOfLastWeekISO = `${endYear}-${endMonth}-${endDay}`;

      return {
        dateFrom: startOfLastWeekISO,
        dateTo: endOfLastWeekISO,
      };
    }

    case 'lastMonth': {
      const lastMonth = new Date(year, now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(year, now.getMonth(), 0);

      const startYear = lastMonth.getFullYear();
      const startMonth = String(lastMonth.getMonth() + 1).padStart(2, '0');
      const startDay = String(lastMonth.getDate()).padStart(2, '0');
      const lastMonthISO = `${startYear}-${startMonth}-${startDay}`;

      const endYear = endOfLastMonth.getFullYear();
      const endMonth = String(endOfLastMonth.getMonth() + 1).padStart(2, '0');
      const endDay = String(endOfLastMonth.getDate()).padStart(2, '0');
      const endOfLastMonthISO = `${endYear}-${endMonth}-${endDay}`;

      return {
        dateFrom: lastMonthISO,
        dateTo: endOfLastMonthISO,
      };
    }

    case 'total':
    default:
      // Return undefined values to indicate no date filtering
      return { dateFrom: undefined, dateTo: undefined };
  }
}

export function useHarvestDashboard(filter?: DashboardFilter) {
  // Calculate date range from predefined filter or use custom dates
  const dateRange = filter?.dateFilter
    ? getDateRange(filter.dateFilter)
    : { dateFrom: filter?.dateFrom, dateTo: filter?.dateTo };

  // Build the filter object, excluding undefined values
  const queryFilter = filter
    ? {
        ...(filter.species && { species: filter.species }),
        ...(filter.variety && { variety: filter.variety }),
        ...(filter.batch && { batch: filter.batch }),
        ...(filter.batchId && { batchId: filter.batchId }),
        ...(dateRange.dateFrom && { dateFrom: dateRange.dateFrom }),
        ...(dateRange.dateTo && { dateTo: dateRange.dateTo }),
        ...(filter.greenhouseId && { greenhouseId: filter.greenhouseId }),
      }
    : undefined;

  // Only pass filter if it has at least one property
  const hasFilterValues = queryFilter && Object.keys(queryFilter).length > 0;

  // The selected tenant in the navbar wins over any caller-supplied tenantId
  // on the local filter — the navbar is the single source of truth for the
  // currently-viewed tenant when an admin is multi-tenanting.
  const selectedTenantId = useTenantIdVariable();
  const tenantId = selectedTenantId ?? filter?.tenantId;

  const { data, loading, error, refetch } = useGetHarvestDashboardQuery({
    variables: {
      filter: hasFilterValues ? queryFilter : undefined,
      tenantId,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: data?.harvestDashboard,
    loading,
    error,
    refetch: () => refetch(),
  };
}

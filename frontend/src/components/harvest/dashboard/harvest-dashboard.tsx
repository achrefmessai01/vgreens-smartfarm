import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { AlertTriangle, Package } from 'lucide-react';
import { useState } from 'react';
import { DashboardChartsGrid } from './dashboard-charts-grid';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import { DashboardFilters } from './harvest-dashboard-filters';
import { HarvestDashboardSkeleton } from './harvest-dashboard-skeleton';

interface HarvestDashboardProps {
  className?: string;
  species?: string;
  variety?: string;
}

const FILTER_LABEL_KEYS: Record<DateFilter, string> = {
  today: 'today',
  thisWeek: 'thisWeek',
  lastWeek: 'lastWeek',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  total: 'total',
};

export function HarvestDashboard({
  className,
  species,
  variety,
}: HarvestDashboardProps) {
  const { t } = useI18n();
  const [currentFilter, setCurrentFilter] = useState<DateFilter>('thisMonth');

  const { data, loading, error, refetch } = useHarvestDashboard(
    currentFilter === 'total'
      ? undefined
      : { dateFilter: currentFilter, species, variety },
  );

  const filterLabel =
    t.common?.[FILTER_LABEL_KEYS[currentFilter] as keyof typeof t.common] ??
    currentFilter;

  if (loading) return <HarvestDashboardSkeleton className={className} />;

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-[300px] px-4 sm:min-h-[400px] ${className}`}
      >
        <div className="text-center max-w-md">
          <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-3 sm:h-8 sm:w-8 sm:mb-4" />
          <p className="text-sm text-destructive mb-3 sm:text-base sm:mb-4">
            {error.message}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="sm:size-default"
          >
            {t.common.retry ?? 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center min-h-[300px] px-4 sm:min-h-[400px] ${className}`}
      >
        <div className="text-center max-w-md">
          <Package className="h-6 w-6 text-muted-foreground mx-auto mb-3 sm:h-8 sm:w-8 sm:mb-4" />
          <p className="text-sm text-muted-foreground sm:text-base">
            No harvest data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            {t.pages.harvest?.performanceDashboard ?? 'Performance Dashboard'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 sm:text-sm">
            {data.harvestCount}{' '}
            {t.pages.harvest?.harvestsLogged ?? 'harvests logged'} for{' '}
            {filterLabel}
          </p>
        </div>
        <DashboardFilters
          onFilterChange={(f) => f.dateFilter && setCurrentFilter(f.dateFilter)}
          className="w-32 sm:w-40"
          defaultValue={currentFilter}
        />
      </div>

      <DashboardMetricsGrid data={data} filterLabel={String(filterLabel)} />
      <DashboardChartsGrid data={data} />
    </div>
  );
}

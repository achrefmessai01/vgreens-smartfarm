import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package } from 'lucide-react';
import { useI18n } from '@/i18n';
import { DashboardFilters } from './dashboard-filters';
import { HarvestDashboardSkeleton } from './harvest-dashboard-skeleton';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import { DashboardChartsGrid } from './dashboard-charts-grid';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';

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

export function HarvestDashboard({ className, species, variety }: HarvestDashboardProps) {
  const { t } = useI18n();
  const [currentFilter, setCurrentFilter] = useState<DateFilter>('thisMonth');

  const { data, loading, error, refetch } = useHarvestDashboard(
    currentFilter === 'total' ? undefined : { dateFilter: currentFilter, species, variety },
  );

  const filterLabel =
    t.common?.[FILTER_LABEL_KEYS[currentFilter] as keyof typeof t.common] ??
    currentFilter;

  if (loading) return <HarvestDashboardSkeleton className={className} />;

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            {t.common.retry ?? 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No harvest data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.pages.harvest?.performanceDashboard ?? 'Performance Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.harvestCount} {t.pages.harvest?.harvestsLogged ?? 'harvests logged'} for{' '}
            {filterLabel}
          </p>
        </div>
        <DashboardFilters
          onFilterChange={(f) => f.dateFilter && setCurrentFilter(f.dateFilter)}
          className="w-64"
          defaultValue={currentFilter}
        />
      </div>

      <DashboardMetricsGrid data={data} filterLabel={String(filterLabel)} />
      <DashboardChartsGrid data={data} />
    </div>
  );
}

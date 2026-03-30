import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MetricCardSkeleton } from './metric-card/metric-card-skeleton';

interface HarvestDashboardSkeletonProps {
  className?: string;
}

export function HarvestDashboardSkeleton({
  className,
}: HarvestDashboardSkeletonProps) {
  return (
    <div className={className}>
      <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="h-7 bg-muted animate-pulse rounded w-48 mb-2 sm:h-8 sm:w-64 lg:h-9" />
          <div className="h-4 bg-muted animate-pulse rounded w-40 sm:w-64" />
        </div>
        <div className="w-32 sm:w-40">
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:gap-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[
          'Yield Over Time',
          'Class Distribution',
          'Brix Trend',
          'Cumulative Yield',
        ].map((title) => (
          <Card key={title}>
            <CardHeader>
              <div className="h-5 bg-muted animate-pulse rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded flex items-center justify-center">
                <span className="text-muted-foreground/50 text-sm">
                  {title}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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
      <div className="mb-6 flex flex-row items-center justify-between gap-4 sm:mb-8">
        <div className="min-w-0 flex-1">
          <div className="bg-muted mb-2 h-7 w-48 animate-pulse rounded sm:h-8 sm:w-64 lg:h-9" />
          <div className="bg-muted h-4 w-40 animate-pulse rounded sm:w-64" />
        </div>
        <div className="w-32 sm:w-40">
          <div className="bg-muted h-10 animate-pulse rounded" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {[
          'Yield Over Time',
          'Class Distribution',
          'Brix Trend',
          'Cumulative Yield',
        ].map((title) => (
          <Card key={title}>
            <CardHeader>
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted flex h-64 animate-pulse items-center justify-center rounded">
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

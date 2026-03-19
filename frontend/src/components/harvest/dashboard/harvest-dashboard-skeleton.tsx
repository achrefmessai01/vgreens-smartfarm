import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MetricCardSkeleton } from './metric-card-skeleton';

interface HarvestDashboardSkeletonProps {
  className?: string;
}

export function HarvestDashboardSkeleton({ className }: HarvestDashboardSkeletonProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 bg-muted animate-pulse rounded w-64 mb-2" />
          <div className="h-5 bg-muted animate-pulse rounded w-96" />
        </div>
        <div className="w-64">
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Yield Over Time', 'Class Distribution', 'Brix Trend', 'Cumulative Yield'].map(
          (title) => (
            <Card key={title}>
              <CardHeader>
                <div className="h-5 bg-muted animate-pulse rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded flex items-center justify-center">
                  <span className="text-muted-foreground/50 text-sm">{title}</span>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

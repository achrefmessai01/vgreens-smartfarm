import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface HarvestDashboardSkeletonProps {
  className?: string;
}

export function HarvestDashboardSkeleton({ className }: HarvestDashboardSkeletonProps) {
  return (
    <div className={className}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 bg-muted animate-pulse rounded w-64 mb-2"></div>
          <div className="h-5 bg-muted animate-pulse rounded w-96"></div>
        </div>
        <div className="w-64">
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton title="Yield Over Time" />
        <ChartCardSkeleton title="Class Distribution" />
        <ChartCardSkeleton title="Brix Trend" />
        <ChartCardSkeleton title="Cumulative Yield" />
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1"></div>
        <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted animate-pulse rounded w-32"></div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted animate-pulse rounded flex items-center justify-center">
          <div className="text-muted-foreground/50 text-sm">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardSkeletonProps {
  className?: string;
}

export function MetricCardSkeleton({ className }: MetricCardSkeletonProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <CardContent className="p-0">
        {/* Icon and Title skeleton */}
        <div className="mb-2 flex items-center justify-between">
          <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
          <div className="bg-muted h-4 w-4 animate-pulse rounded"></div>
        </div>

        {/* Value skeleton */}
        <div className="bg-muted mb-1 h-8 w-16 animate-pulse rounded"></div>

        {/* Subtitle skeleton */}
        <div className="bg-muted h-3 w-24 animate-pulse rounded"></div>
      </CardContent>
    </Card>
  );
}

// Alternative compact version
export function MetricCardSkeletonCompact({
  className,
}: MetricCardSkeletonProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <CardContent className="p-0">
        <div className="space-y-2">
          <div className="bg-muted h-3 w-16 animate-pulse rounded"></div>
          <div className="bg-muted h-6 w-12 animate-pulse rounded"></div>
          <div className="bg-muted h-2 w-20 animate-pulse rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

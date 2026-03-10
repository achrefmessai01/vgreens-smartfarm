import { Card, CardContent } from '@/components/ui/card';

interface MetricCardSkeletonProps {
  className?: string;
}

export function MetricCardSkeleton({ className }: MetricCardSkeletonProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <CardContent className="p-0">
        {/* Icon and Title skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
        </div>
        
        {/* Value skeleton */}
        <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1"></div>
        
        {/* Subtitle skeleton */}
        <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
      </CardContent>
    </Card>
  );
}

// Alternative compact version
export function MetricCardSkeletonCompact({ className }: MetricCardSkeletonProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <CardContent className="p-0">
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded w-16"></div>
          <div className="h-6 bg-muted animate-pulse rounded w-12"></div>
          <div className="h-2 bg-muted animate-pulse rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  );
}
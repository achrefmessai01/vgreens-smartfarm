import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MetricCardSkeleton } from './metric-card/metric-card-skeleton';

// Body-only skeleton — used inline inside the dashboard while data loads.
// The real header (with the batch/period filter bar) stays mounted above it,
// so we intentionally do NOT render header stubs here. Rendering them would
// unmount the live filter bar and its popover on every refetch.
export function HarvestDashboardBodySkeleton() {
  return (
    <>
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
    </>
  );
}

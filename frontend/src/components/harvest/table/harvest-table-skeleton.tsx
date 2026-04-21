'use client';

export function HarvestTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-card rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="bg-muted h-4 w-40 animate-pulse rounded" />
              <div className="bg-muted h-3 w-28 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-8 w-24 animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="bg-muted h-8 animate-pulse rounded" />
            <div className="bg-muted h-8 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

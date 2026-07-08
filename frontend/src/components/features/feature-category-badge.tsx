import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

interface FeatureCategoryBadgeProps {
  category: string | null | undefined;
  uncategorizedLabel: string;
  className?: string;
}

/**
 * Category badge for a feature. Renders a pill with a small tag icon and
 * the category label when the feature has one; otherwise renders a plain
 * muted "Uncategorized" label (no pill, no italic) — the design calls for
 * this in both list AND grid surfaces so the eye isn't pulled to an empty
 * pill on nearly every row.
 */
export function FeatureCategoryBadge({
  category,
  uncategorizedLabel,
  className,
}: FeatureCategoryBadgeProps) {
  const trimmed = (category ?? '').trim();

  if (!trimmed) {
    return (
      <span className={cn('text-muted-foreground text-sm', className)}>
        {uncategorizedLabel}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-foreground gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        className,
      )}
    >
      <Tag className="h-3 w-3" />
      {trimmed}
    </Badge>
  );
}

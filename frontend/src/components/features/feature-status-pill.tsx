import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeatureStatusPillProps {
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
  className?: string;
}

/**
 * Status pill for the feature-flags surface: green dot + label for active,
 * muted grey for inactive. Mirrors `UserStatusPill` and the tenant status
 * pill so all admin tables read the same at a glance.
 */
export function FeatureStatusPill({
  isActive,
  activeLabel,
  inactiveLabel,
  className,
}: FeatureStatusPillProps) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={cn(
        'gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        isActive && 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          isActive ? 'bg-emerald-400' : 'bg-muted-foreground',
        )}
      />
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { UserStatus } from '@/generated/graphql';
import { cn } from '@/lib/utils';

interface UserStatusPillTranslations {
  active: string;
  inactive: string;
  pending: string;
}

interface UserStatusPillProps {
  status: UserStatus | null | undefined;
  isActive: boolean;
  translations: UserStatusPillTranslations;
  className?: string;
}

/**
 * Status pill shared by the users list row + grid card. Green dot + label
 * for active, muted grey for inactive, outline for pending — mirrors the
 * tenants status pill so both admin tables read the same.
 */
export function UserStatusPill({
  status,
  isActive,
  translations,
  className,
}: UserStatusPillProps) {
  const isPending = status === UserStatus.Pending;
  const label = isPending
    ? translations.pending
    : isActive
      ? translations.active
      : translations.inactive;

  return (
    <Badge
      variant={isPending ? 'outline' : isActive ? 'default' : 'secondary'}
      className={cn(
        'gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        !isPending &&
          isActive &&
          'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          isPending
            ? 'bg-muted-foreground'
            : isActive
              ? 'bg-emerald-400'
              : 'bg-muted-foreground',
        )}
      />
      {label}
    </Badge>
  );
}

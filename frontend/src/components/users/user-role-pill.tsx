import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/generated/graphql';
import { cn } from '@/lib/utils';

interface UserRolePillProps {
  role: UserRole;
  label: string;
  className?: string;
}

/**
 * Role → color mapping for the users surface. Each role gets a dot +
 * subtle tinted background so the four roles read distinctly at a glance:
 * vGreens Admin (emerald), vGreens Member (sky), Tenant Admin (violet),
 * Tenant User (muted). Mirrors `UserStatusPill` visually so the two pills
 * sit well side-by-side on the row / card.
 */
export function UserRolePill({ role, label, className }: UserRolePillProps) {
  const styles = ROLE_STYLES[role] ?? ROLE_STYLES.TENANT_USER;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-full border-transparent px-2 py-0.5 text-[11px] font-medium',
        styles.badge,
        className,
      )}
    >
      <span
        className={cn('inline-block h-1.5 w-1.5 rounded-full', styles.dot)}
      />
      {label}
    </Badge>
  );
}

const ROLE_STYLES: Record<UserRole, { badge: string; dot: string }> = {
  VGREENS_ADMIN: {
    badge: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
    dot: 'bg-emerald-400',
  },
  VGREENS_MEMBER: {
    badge: 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/15',
    dot: 'bg-sky-400',
  },
  TENANT_ADMIN: {
    badge: 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/15',
    dot: 'bg-violet-400',
  },
  TENANT_USER: {
    badge: 'bg-muted text-muted-foreground hover:bg-muted',
    dot: 'bg-muted-foreground',
  },
};

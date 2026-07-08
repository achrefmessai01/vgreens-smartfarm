import { getAvatarPalette, getInitials } from '@/lib/avatar-color';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  userId: string;
  name: string | null | undefined;
  /** `xs` for tiny inline chips, `sm` for list rows, `md` for grid cards. */
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

/**
 * Small colored square with the user's initials, used as a stand-in for
 * a real avatar in the users table redesign. Color is derived
 * deterministically from `userId` so it's stable across renders and
 * across the list and grid views. Mirrors `TenantAvatar` — the two
 * surfaces read the same because they share `@/lib/avatar-color`.
 */
export function UserAvatar({
  userId,
  name,
  size = 'sm',
  className,
}: UserAvatarProps) {
  const palette = getAvatarPalette(userId);
  const initials = getInitials(name, 'U');

  const dimensions =
    size === 'md'
      ? 'h-10 w-10 text-sm'
      : size === 'xs'
        ? 'h-6 w-6 text-[10px]'
        : 'h-8 w-8 text-xs';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-semibold',
        dimensions,
        palette.bg,
        palette.text,
        className,
      )}
    >
      {initials}
    </div>
  );
}

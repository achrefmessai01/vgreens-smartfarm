import { cn } from '@/lib/utils';
import {
  getTenantAvatarPalette,
  getTenantInitials,
} from '@/lib/tenant-avatar-color';

interface TenantAvatarProps {
  tenantId: string;
  name: string | null | undefined;
  /** `sm` for list rows, `md` for grid cards. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Small colored square with the tenant's initials, used as a stand-in for
 * a real avatar in the tenants table redesign. Color is derived
 * deterministically from `tenantId` so it's stable across renders and
 * across the list and grid views.
 */
export function TenantAvatar({
  tenantId,
  name,
  size = 'sm',
  className,
}: TenantAvatarProps) {
  const palette = getTenantAvatarPalette(tenantId);
  const initials = getTenantInitials(name);

  const dimensions =
    size === 'md' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';

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

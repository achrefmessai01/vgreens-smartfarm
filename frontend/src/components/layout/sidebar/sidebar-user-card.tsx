'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

interface SidebarUserCardProps {
  /** Display name (already resolved to first+last or "Unknown User"). */
  name: string;
  /** Localized role label — resolved by the caller via `getRoleLabel`. */
  roleLabel: string;
  avatarUrl?: string;
  isCollapsed: boolean;
  mobile: boolean;
  onLogout?: () => void;
}

/**
 * Bottom-of-sidebar profile card: avatar, name, role pill, logout icon.
 * Collapsed rail shows just the avatar and a small logout icon underneath.
 */
export function SidebarUserCard({
  name,
  roleLabel,
  avatarUrl,
  isCollapsed,
  mobile,
  onLogout,
}: SidebarUserCardProps) {
  const { t } = useI18n();
  const logoutLabel = t.common.logout;
  const initial = name.charAt(0).toUpperCase();
  const showBody = !isCollapsed || mobile;

  return (
    <div className="border-border dark:border-sidebar-border/70 border-t p-4">
      <div
        className={cn(
          'flex items-center gap-3',
          isCollapsed && !mobile && 'flex-col gap-2',
        )}
      >
        <Avatar className="h-9 w-9 shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground dark:bg-sidebar-accent dark:text-sidebar-accent-foreground dark:border-sidebar-border/70 text-sm font-semibold dark:border">
              {initial}
            </AvatarFallback>
          )}
        </Avatar>
        {showBody && (
          <div className="min-w-0 flex-1">
            <p className="text-foreground dark:text-sidebar-foreground truncate text-sm font-semibold">
              {name}
            </p>
            <span className="mt-0.5 inline-flex max-w-full items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
              <span className="truncate">{roleLabel}</span>
            </span>
          </div>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            aria-label={logoutLabel}
            title={logoutLabel}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

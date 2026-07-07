'use client';

import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n';
import { Moon, Sun } from 'lucide-react';

interface SidebarDarkModeRowProps {
  isCollapsed: boolean;
  mobile: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

/**
 * Dark-mode toggle row. Renders a single leading icon that flips between sun
 * (currently light) and moon (currently dark) alongside the label + switch.
 * When collapsed we render just the icon as a click target so the affordance
 * is still one tap away.
 */
export function SidebarDarkModeRow({
  isCollapsed,
  mobile,
  theme,
  setTheme,
}: SidebarDarkModeRowProps) {
  const { t } = useI18n();
  const sidebar = (t.common as unknown as {
    sidebar?: Partial<{
      darkMode: string;
      lightMode: string;
    }>;
  }).sidebar;
  const darkModeLabel = sidebar?.darkMode ?? 'Dark mode';
  const lightModeLabel = sidebar?.lightMode ?? 'Light mode';

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  // The row is always labelled "Dark mode" per the mockup; the aria/title
  // still describe what the toggle *will do* so screen readers announce the
  // action rather than the current state.
  const rowLabel = darkModeLabel;
  const ariaLabel = isDark ? lightModeLabel : darkModeLabel;
  // Icon reflects the *current* theme: moon while dark, sun while light. It
  // flips as soon as the user toggles, so the icon acts as both a status
  // indicator and a preview of the previous state.
  const Icon = isDark ? Moon : Sun;

  if (isCollapsed && !mobile) {
    return (
      <div className="flex justify-center px-3 py-3">
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          aria-label={ariaLabel}
          title={ariaLabel}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="text-muted-foreground h-4 w-4 transition-colors" />
        <span className="text-foreground dark:text-sidebar-foreground text-sm font-medium">
          {rowLabel}
        </span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={ariaLabel}
      />
    </div>
  );
}

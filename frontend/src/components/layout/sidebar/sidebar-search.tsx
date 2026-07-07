'use client';

import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
  /** When collapsed we render just the search icon, no input. */
  isCollapsed: boolean;
  mobile: boolean;
}

/**
 * Search field pinned near the top of the sidebar. The design ships this as a
 * visual affordance only — no keyboard shortcut wiring yet — so we keep the
 * ⌘K chip decorative and let the input hold no state. When search actually
 * ships we can pipe an `onChange` in without changing the layout.
 */
export function SidebarSearch({ isCollapsed, mobile }: SidebarSearchProps) {
  const { t } = useI18n();
  const sidebar = (t.common as unknown as {
    sidebar?: Partial<{ searchPlaceholder: string; commandKeyHint: string }>;
  }).sidebar;
  const placeholder = sidebar?.searchPlaceholder ?? 'Search';
  const shortcutHint = sidebar?.commandKeyHint ?? '⌘K';

  if (isCollapsed && !mobile) {
    return (
      <div className="flex justify-center px-3 pt-4">
        <div
          className="border-border/60 flex h-9 w-9 items-center justify-center rounded-md border"
          aria-label={placeholder}
        >
          <Search className="text-muted-foreground h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={placeholder}
          className="border-border/60 bg-muted/30 h-9 pr-14 pl-8 text-sm"
          aria-label={placeholder}
        />
        <span
          aria-hidden
          className="border-border/60 bg-background text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10px]"
        >
          {shortcutHint}
        </span>
      </div>
    </div>
  );
}

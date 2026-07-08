'use client';

import { Button } from '@/components/ui/button';
import '@/components/ui/logo-spin.css';
import { LogoSVG } from '@/components/ui/logo-svg';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import * as React from 'react';

interface SidebarBrandProps {
  isCollapsed: boolean;
  mobile: boolean;
  onToggleCollapse: () => void;
}

/**
 * Sidebar header: brand logo + wordmark + collapse toggle. When collapsed we
 * hide the wordmark and turn the whole brand block into the expand-affordance
 * so users can pop the sidebar back open in one click.
 */
export function SidebarBrand({
  isCollapsed,
  mobile,
  onToggleCollapse,
}: SidebarBrandProps) {
  const { t } = useI18n();
  const sidebar = (t.common as unknown as {
    sidebar?: Partial<{
      brand: string;
      collapse: string;
      expand: string;
    }>;
  }).sidebar;
  const brand = sidebar?.brand ?? 'vGreens Lab';
  const collapseLabel = sidebar?.collapse ?? 'Collapse sidebar';
  const expandLabel = sidebar?.expand ?? 'Expand sidebar';

  const showCollapseButton = !mobile;
  const showWordmark = !isCollapsed || mobile;

  return (
    <div className="border-border dark:border-sidebar-border/70 flex h-16 items-center justify-between border-b px-4">
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 border-0 bg-transparent p-0 text-left',
          isCollapsed &&
            !mobile &&
            'cursor-pointer transition-opacity hover:opacity-80',
        )}
        onClick={isCollapsed && !mobile ? onToggleCollapse : undefined}
        disabled={!isCollapsed || mobile}
        aria-label={isCollapsed && !mobile ? expandLabel : brand}
      >
        <div className="sidebar-logo-spin h-8 w-8 shrink-0" aria-hidden>
          <div className="sidebar-spin-3d">
            <div className="sidebar-face sidebar-front">
              <LogoSVG color="#016F7C" className="object-contain" />
            </div>
            <div className="sidebar-face sidebar-back">
              <LogoSVG color="#004D56" className="object-contain" />
            </div>
          </div>
        </div>
        {showWordmark && (
          <span className="text-foreground dark:text-sidebar-foreground truncate text-sm font-semibold">
            {brand}
          </span>
        )}
      </button>
      {showCollapseButton && !isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={onToggleCollapse}
          aria-label={collapseLabel}
          title={collapseLabel}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      )}
      {showCollapseButton && isCollapsed && (
        // The expand affordance lives on the brand button above, but we still
        // keep an accessible fallback icon for screen readers so the intent
        // is obvious even without hovering the brand block.
        <span className="sr-only" role="presentation">
          <PanelLeftOpen aria-hidden />
        </span>
      )}
    </div>
  );
}

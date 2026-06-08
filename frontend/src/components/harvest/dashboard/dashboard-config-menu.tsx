'use client';

import * as React from 'react';
import { LayoutDashboard, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import { useSetTenantHarvestDashboardItemsMutation } from '@/generated/graphql';
import { cn } from '@/lib/utils';
import {
  ALL_DASHBOARD_ITEM_IDS,
  DASHBOARD_ITEM_CATEGORIES,
  HARVEST_DASHBOARD_ITEMS,
  type DashboardItemCategory,
} from './dashboard-items';

interface DashboardConfigMenuProps {
  /** Target tenant whose configuration is being edited. */
  tenantId: string;
  /** Currently hidden item ids for the tenant. */
  hiddenSet: Set<string>;
}

/**
 * Tenant-admin editor for the harvest dashboard. Lists every configurable item
 * grouped by category with a checkbox per item; toggling persists the tenant's
 * hidden-item set immediately (optimistic cache update). Only rendered for
 * tenant admins by the dashboard.
 */
export function DashboardConfigMenu({
  tenantId,
  hiddenSet,
}: DashboardConfigMenuProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [setItemsMutation] = useSetTenantHarvestDashboardItemsMutation();

  const totalCount = ALL_DASHBOARD_ITEM_IDS.length;
  const visibleCount = ALL_DASHBOARD_ITEM_IDS.filter(
    (id) => !hiddenSet.has(id),
  ).length;

  const persist = React.useCallback(
    async (nextHidden: Set<string>) => {
      setSaving(true);
      try {
        await setItemsMutation({
          variables: { hiddenItems: Array.from(nextHidden), tenantId },
          update: (cache, result) => {
            const updated = result.data?.setTenantHarvestDashboardItems;
            if (!updated) return;
            cache.modify({
              id: cache.identify({ __typename: 'Tenant', id: updated.id }),
              fields: {
                hiddenHarvestDashboardItems: () =>
                  updated.hiddenHarvestDashboardItems,
              },
            });
          },
        });
      } catch (err) {
        toast({
          title: h?.configSaveFailed ?? 'Failed to save dashboard configuration',
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [setItemsMutation, tenantId, toast, h],
  );

  const handleToggle = React.useCallback(
    (id: string, visible: boolean) => {
      const next = new Set(hiddenSet);
      if (visible) {
        next.delete(id);
      } else {
        next.add(id);
      }
      void persist(next);
    },
    [hiddenSet, persist],
  );

  const handleToggleAll = React.useCallback(
    (visible: boolean) => {
      void persist(visible ? new Set<string>() : new Set(ALL_DASHBOARD_ITEM_IDS));
    },
    [persist],
  );

  const groupLabel: Record<DashboardItemCategory, string> = {
    metrics: h?.configMetricsGroup ?? 'Metrics',
    charts: h?.configChartsGroup ?? 'Charts',
  };

  const triggerLabel = h?.configEditDashboard ?? 'Edit dashboard';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          disabled={saving}
          aria-label={triggerLabel}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-xs font-medium">{triggerLabel}</span>
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {visibleCount}/{totalCount}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-64 overflow-y-auto p-1.5"
      >
        <DropdownMenuLabel className="flex items-center gap-2 px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>{triggerLabel}</span>
          <span className="text-muted-foreground ml-auto text-[10px] tabular-nums normal-case">
            {visibleCount} / {totalCount} {h?.configVisibleSuffix ?? 'visible'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DASHBOARD_ITEM_CATEGORIES.map((category) => {
          const items = HARVEST_DASHBOARD_ITEMS.filter(
            (item) => item.category === category,
          );
          if (items.length === 0) return null;
          return (
            <React.Fragment key={category}>
              <DropdownMenuLabel className="text-muted-foreground px-2 pt-1.5 pb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                {groupLabel[category]}
              </DropdownMenuLabel>
              <div className="flex flex-col gap-0.5 pb-1">
                {items.map((item) => {
                  const visible = !hiddenSet.has(item.id);
                  const label =
                    (h?.[item.labelKey as keyof typeof h] as
                      | string
                      | undefined) ?? item.fallback;
                  return (
                    <DropdownMenuCheckboxItem
                      key={item.id}
                      checked={visible}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(checked) =>
                        handleToggle(item.id, checked === true)
                      }
                      className={cn(
                        'rounded-md py-1.5 transition-opacity',
                        !visible && 'opacity-55',
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm font-medium',
                          !visible && 'line-through decoration-[1.5px]',
                        )}
                      >
                        {label}
                      </span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
        <DropdownMenuSeparator />
        <div className="flex items-center gap-1 px-1 pt-1 pb-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 flex-1 text-[11px] font-medium"
            onClick={() => handleToggleAll(true)}
            disabled={saving || visibleCount === totalCount}
          >
            {h?.configShowAll ?? 'Show all'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 flex-1 text-[11px] font-medium"
            onClick={() => handleToggleAll(false)}
            disabled={saving || visibleCount === 0}
          >
            {h?.configHideAll ?? 'Hide all'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

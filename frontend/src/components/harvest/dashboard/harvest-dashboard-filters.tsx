'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import type { HarvestBatchListItem } from '@/lib/hooks/use-harvest-batches';
import { type DateFilter } from '@/lib/hooks/use-harvest-dashboard';
import {
  ALL_BATCHES,
  MAX_COMPARE_BATCHES,
} from '@/lib/hooks/use-harvest-dashboard-url-state';
import { cn } from '@/lib/utils';
import { Leaf, Clock, GitCompareArrows, X } from 'lucide-react';

export interface DashboardFiltersProps {
  period: DateFilter;
  onPeriodChange: (period: DateFilter) => void;
  batches: HarvestBatchListItem[];
  batchesLoading: boolean;
  batchId: string | undefined;
  onBatchChange: (batchId: string | undefined) => void;
  compareMode: boolean;
  compareBatchIds: string[];
  onCompareToggle: () => void;
  onCompareBatchesChange: (ids: string[]) => void;
  className?: string;
}

export function DashboardFilters({
  period,
  onPeriodChange,
  batches,
  batchesLoading,
  batchId,
  onBatchChange,
  compareMode,
  compareBatchIds,
  onCompareToggle,
  onCompareBatchesChange,
  className,
}: DashboardFiltersProps) {
  const { t } = useI18n();

  const PERIOD_ICON: Record<DateFilter, typeof Clock> = {
    today: Clock,
    thisWeek: Clock,
    lastWeek: Clock,
    thisMonth: Clock,
    lastMonth: Clock,
    total: Clock,
  };

  const periodOptions: { value: DateFilter; label: string }[] = [
    { value: 'today', label: t.common?.today || 'Today' },
    { value: 'thisWeek', label: t.common?.thisWeek || 'This Week' },
    { value: 'lastWeek', label: t.common?.lastWeek || 'Last Week' },
    { value: 'thisMonth', label: t.common?.thisMonth || 'This Month' },
    { value: 'lastMonth', label: t.common?.lastMonth || 'Last Month' },
    {
      value: 'total',
      label: t.common?.total || t.pages.harvest?.total || 'Total',
    },
  ];

  const hasBatches = batches.length > 0;
  const showCompareButton = hasBatches && batches.length >= 2;

  const toggleCompareBatch = (id: string) => {
    if (compareBatchIds.includes(id)) {
      onCompareBatchesChange(compareBatchIds.filter((x) => x !== id));
    } else if (compareBatchIds.length < MAX_COMPARE_BATCHES) {
      onCompareBatchesChange([...compareBatchIds, id]);
    }
  };

  return (
    <div
      className={cn('flex flex-wrap items-center justify-end gap-2', className)}
    >
      <Select
        value={period}
        onValueChange={(v) => onPeriodChange(v as DateFilter)}
      >
        <SelectTrigger className="h-9 w-40">
          <SelectValue
            placeholder={t.common?.selectPeriod || 'Select period'}
          />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => {
            const ItemIcon = PERIOD_ICON[option.value] ?? Clock;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                <ItemIcon
                  className="text-muted-foreground h-3.5 w-3.5"
                  aria-hidden
                />
                <span>{option.label}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {compareMode ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 min-w-44 justify-start gap-2"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden />
              <span className="truncate">
                {compareBatchIds.length === 0
                  ? 'Select batches'
                  : `${compareBatchIds.length} batch${compareBatchIds.length === 1 ? '' : 'es'} selected`}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-72 p-0">
            <div className="text-muted-foreground px-3 pt-3 pb-2 text-xs font-medium">
              Pick up to {MAX_COMPARE_BATCHES} batches to compare
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-2">
              {batches.map((b) => {
                const checked = compareBatchIds.includes(b.id);
                const disabled =
                  !checked && compareBatchIds.length >= MAX_COMPARE_BATCHES;
                return (
                  <label
                    key={b.id}
                    className={cn(
                      'hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      disabled && 'pointer-events-none opacity-50',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleCompareBatch(b.id)}
                      disabled={disabled}
                      aria-label={b.name}
                    />
                    <span className="truncate">
                      {b.name}{' '}
                      <span className="text-muted-foreground">
                        ({b.species})
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Select
          value={batchId ?? ALL_BATCHES}
          onValueChange={(v) =>
            onBatchChange(v === ALL_BATCHES ? undefined : v)
          }
          disabled={!hasBatches && !batchesLoading}
        >
          <SelectTrigger className="h-9 min-w-44">
            <SelectValue
              placeholder={
                batchesLoading
                  ? 'Loading batches...'
                  : hasBatches
                    ? 'All batches'
                    : 'No batches yet'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BATCHES} className="text-sm">
              <Leaf></Leaf> All batches
            </SelectItem>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-sm">
                <Leaf></Leaf> {b.name}
                <span className="text-muted-foreground">({b.species})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showCompareButton && (
        <Button
          variant={compareMode ? 'secondary' : 'outline'}
          size="sm"
          className="h-9 gap-2"
          onClick={onCompareToggle}
        >
          {compareMode ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <GitCompareArrows className="h-4 w-4" aria-hidden />
          )}
          {compareMode ? 'Exit compare' : 'Compare'}
        </Button>
      )}
    </div>
  );
}

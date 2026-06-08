'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client';
import {
  AlertCircle,
  Calendar,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { HARVESTS_COUNT_QUERY } from '@/graphql/queries/harvest.queries';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  useHarvestExport,
  type HarvestExportFilter,
} from '@/lib/hooks/use-harvest-export';
import { isAutoDraftPlaceholder } from '@/components/harvest/table/harvest-table-utils';
import { HarvestStatus } from '@/generated/graphql';

type Preset =
  | 'allTime'
  | 'last30Days'
  | 'last90Days'
  | 'thisMonth'
  | 'thisYear'
  | 'custom';

interface HarvestExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeForPreset(preset: Preset): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();
  const today = toIsoDate(now);
  if (preset === 'allTime') return {};
  if (preset === 'last30Days') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { dateFrom: toIsoDate(from), dateTo: today };
  }
  if (preset === 'last90Days') {
    const from = new Date(now);
    from.setDate(from.getDate() - 90);
    return { dateFrom: toIsoDate(from), dateTo: today };
  }
  if (preset === 'thisMonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: toIsoDate(from), dateTo: today };
  }
  if (preset === 'thisYear') {
    const from = new Date(now.getFullYear(), 0, 1);
    return { dateFrom: toIsoDate(from), dateTo: today };
  }
  return {};
}

function formatNice(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function filenamePreview(filter: HarvestExportFilter): string {
  const today = new Date().toISOString().slice(0, 10);
  if (filter.dateFrom && filter.dateTo) {
    return `harvest-export-${filter.dateFrom}_to_${filter.dateTo}.csv`;
  }
  if (filter.dateFrom) return `harvest-export-from-${filter.dateFrom}.csv`;
  if (filter.dateTo) return `harvest-export-until-${filter.dateTo}.csv`;
  return `harvest-export-${today}.csv`;
}

export function HarvestExportDialog({
  open,
  onOpenChange,
}: HarvestExportDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { exportCsv, isExporting } = useHarvestExport();

  const [preset, setPreset] = React.useState<Preset>('allTime');
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setPreset('allTime');
      setCustomFrom('');
      setCustomTo('');
    }
  }, [open]);

  const computedRange: HarvestExportFilter = React.useMemo(() => {
    if (preset === 'custom') {
      return {
        ...(customFrom ? { dateFrom: customFrom } : {}),
        ...(customTo ? { dateTo: customTo } : {}),
      };
    }
    return rangeForPreset(preset);
  }, [preset, customFrom, customTo]);

  const previewFrom =
    preset === 'custom' ? customFrom : (computedRange.dateFrom ?? '');
  const previewTo =
    preset === 'custom' ? customTo : (computedRange.dateTo ?? '');

  const invalidRange =
    preset === 'custom' &&
    customFrom !== '' &&
    customTo !== '' &&
    customFrom > customTo;

  const { data: countData, loading: countLoading } = useQuery<{
    harvests: Array<{
      id: string;
      parentBatchId: string | null;
      status: HarvestStatus;
      classA: number;
      classB: number;
      waste: number;
      avgBrix: number;
      rowX: number;
      rowY: number;
      photos: number;
    }>;
  }>(HARVESTS_COUNT_QUERY, {
    variables: {
      filter:
        computedRange.dateFrom || computedRange.dateTo ? computedRange : null,
    },
    skip: !open || invalidRange,
    fetchPolicy: 'cache-and-network',
  });

  // Empty draft placeholders are excluded from the export, so they must not be
  // counted here either.
  const count = countData?.harvests?.filter(
    (entry) => !isAutoDraftPlaceholder(entry),
  ).length;

  const handleDownload = async () => {
    const ok = await exportCsv(computedRange);
    if (ok) {
      onOpenChange(false);
    }
  };

  const presets: { id: Preset; label: string }[] = [
    { id: 'allTime', label: h?.presetAllTime || 'All time' },
    { id: 'last30Days', label: h?.presetLast30Days || 'Last 30 days' },
    { id: 'last90Days', label: h?.presetLast90Days || 'Last 90 days' },
    { id: 'thisMonth', label: h?.presetThisMonth || 'This month' },
    { id: 'thisYear', label: h?.presetThisYear || 'This year' },
    { id: 'custom', label: h?.presetCustom || 'Custom' },
  ];

  const rangeLabel =
    previewFrom && previewTo
      ? `${formatNice(previewFrom)} → ${formatNice(previewTo)}`
      : previewFrom
        ? `${h?.from || 'From'} ${formatNice(previewFrom)}`
        : previewTo
          ? `${h?.to || 'Until'} ${formatNice(previewTo)}`
          : h?.presetAllTime || 'All time';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Hero header with subtle teal gradient */}
        <div className="relative shrink-0 overflow-hidden border-b bg-gradient-to-br from-[#016f7c]/10 via-[#016f7c]/5 to-transparent px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#016f7c]/10 blur-2xl"
          />
          <div className="relative flex items-start gap-3 sm:gap-3.5">
            <div className="shrink-0 rounded-xl bg-white p-2 text-[#016f7c] shadow-sm ring-1 ring-[#016f7c]/20 sm:p-2.5 dark:bg-[#016f7c]/15">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold sm:text-lg">
                {h?.exportDialogTitle || 'Export Harvest Data'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs sm:text-sm">
                {h?.exportDialogDescription ||
                  'Choose the time range of harvest data to export as a CSV file.'}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5 sm:pb-2">
          {/* Preset chips */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
              {h?.timeRange || 'Time range'}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {presets.map((p) => {
                const selected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={cn(
                      'group relative flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-150 sm:px-3 sm:text-sm',
                      selected
                        ? 'border-[#016f7c] bg-[#016f7c]/10 text-[#016f7c] shadow-sm ring-1 ring-[#016f7c]/20'
                        : 'border-border bg-background text-foreground/80 hover:-translate-y-px hover:border-[#016f7c]/40 hover:bg-[#016f7c]/5 hover:text-foreground hover:shadow-sm',
                    )}
                  >
                    {selected && (
                      <Check
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={3}
                      />
                    )}
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom date inputs — only when Custom preset is selected */}
          {preset === 'custom' && (
            <div className="animate-in fade-in-0 slide-in-from-top-1 rounded-lg border bg-muted/20 p-3 duration-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                    <Calendar className="h-3 w-3" />
                    {h?.from || 'From'}
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="border-input bg-background focus:border-[#016f7c] focus:ring-[#016f7c]/20 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm transition-colors focus:ring-2 focus:outline-none"
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                    <Calendar className="h-3 w-3" />
                    {h?.to || 'To'}
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="border-input bg-background focus:border-[#016f7c] focus:ring-[#016f7c]/20 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm transition-colors focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary card */}
          <div
            className={cn(
              'rounded-lg border p-3 transition-colors',
              invalidRange
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-[#016f7c]/20 bg-gradient-to-br from-[#016f7c]/[0.04] to-transparent',
            )}
          >
            {invalidRange ? (
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-destructive font-medium leading-snug">
                  {h?.invalidRange ||
                    '"From" date must be before "To" date'}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-md bg-[#016f7c]/10 p-1.5 text-[#016f7c]">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  {countLoading && count === undefined ? (
                    <p className="text-muted-foreground text-sm">
                      {h?.calculatingCount || 'Calculating…'}
                    </p>
                  ) : count !== undefined ? (
                    <p className="text-foreground text-sm leading-snug break-words">
                      <span className="text-base font-semibold tabular-nums sm:text-lg">
                        {count}
                      </span>{' '}
                      <span className="text-muted-foreground text-xs">
                        {(
                          h?.harvestsWillBeExported ||
                          '{count} harvests will be exported'
                        )
                          .replace('{count}', '')
                          .trim()}
                      </span>
                    </p>
                  ) : (
                    <Sparkles className="text-muted-foreground h-4 w-4" />
                  )}
                  <p className="text-muted-foreground text-xs leading-snug break-words">
                    {rangeLabel}
                  </p>
                  <p className="text-muted-foreground/80 font-mono text-[10px] leading-snug break-all sm:text-[11px]">
                    {filenamePreview(computedRange)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="w-full sm:w-auto sm:min-w-[6rem]"
          >
            {h?.cancel || 'Cancel'}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isExporting || invalidRange}
            className="group relative w-full overflow-hidden bg-[#016f7c] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#015862] hover:shadow-lg active:translate-y-0 sm:w-auto sm:min-w-[10rem]"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            )}
            {isExporting
              ? h?.exporting || 'Exporting…'
              : h?.downloadCsv || 'Download CSV'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

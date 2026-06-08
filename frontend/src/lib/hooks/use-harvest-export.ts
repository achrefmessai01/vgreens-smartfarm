'use client';

import { useCallback, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { HARVESTS_CSV_EXPORT_QUERY } from '@/graphql/queries/harvest.queries';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';

export interface HarvestExportFilter {
  dateFrom?: string;
  dateTo?: string;
}

function filenameFor(filter?: HarvestExportFilter): string {
  const today = new Date().toISOString().slice(0, 10);
  if (filter?.dateFrom && filter.dateTo) {
    return `harvest-export-${filter.dateFrom}_to_${filter.dateTo}.csv`;
  }
  if (filter?.dateFrom) {
    return `harvest-export-from-${filter.dateFrom}.csv`;
  }
  if (filter?.dateTo) {
    return `harvest-export-until-${filter.dateTo}.csv`;
  }
  return `harvest-export-${today}.csv`;
}

export function useHarvestExport() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [runExport] = useLazyQuery<
    { harvestsCsvExport: string },
    { filter: HarvestExportFilter | null; columns: string[] | null }
  >(HARVESTS_CSV_EXPORT_QUERY, { fetchPolicy: 'network-only' });

  const exportCsv = useCallback(
    async (
      filter?: HarvestExportFilter,
      columns?: string[],
    ): Promise<boolean> => {
      setIsExporting(true);
      try {
        const variables = {
          filter:
            filter && (filter.dateFrom || filter.dateTo)
              ? {
                  ...(filter.dateFrom ? { dateFrom: filter.dateFrom } : {}),
                  ...(filter.dateTo ? { dateTo: filter.dateTo } : {}),
                }
              : null,
          columns: columns && columns.length > 0 ? columns : null,
        };
        const { data, error } = await runExport({ variables });
        if (error || data?.harvestsCsvExport == null) {
          throw error ?? new Error('Empty CSV response');
        }

        const blob = new Blob([data.harvestsCsvExport], {
          type: 'text/csv;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filenameFor(filter);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast({
          title: t.pages.harvest?.exportSuccess || 'Harvest data exported',
        });
        return true;
      } catch {
        toast({
          title:
            t.pages.harvest?.exportError || 'Failed to export harvest data',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    [runExport, toast, t],
  );

  return { exportCsv, isExporting };
}

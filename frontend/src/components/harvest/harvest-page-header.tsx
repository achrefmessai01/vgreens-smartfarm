'use client';

import { useI18n } from '@/i18n';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HarvestSummary } from '@/types/harvest.types';

interface HarvestPageHeaderProps {
  summary: HarvestSummary;
  title: string;
  onCreateBatch?: () => void;
  onExportClick?: () => void;
  isLoading?: boolean;
}

export function HarvestPageHeader({
  summary,
  title,
  onCreateBatch,
  onExportClick,
  isLoading = false,
}: HarvestPageHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {summary.totalHarvests}{' '}
            {t.pages.harvest?.harvestsLogged || 'harvests logged'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {onExportClick && (
            <Button
              onClick={onExportClick}
              disabled={isLoading}
              variant="outline"
              className="group relative w-full overflow-hidden border-[#016f7c]/30 bg-gradient-to-br from-white to-[#016f7c]/[0.03] text-[#016f7c] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:from-[#016f7c]/10 hover:to-[#016f7c]/5 hover:text-[#016f7c] hover:shadow-md sm:w-auto dark:from-transparent dark:to-[#016f7c]/[0.06]"
            >
              <Download className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              {t.pages.harvest?.exportCsv || 'Export CSV'}
            </Button>
          )}

          {onCreateBatch && (
            <Button
              onClick={onCreateBatch}
              disabled={isLoading}
              className="group relative w-full overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:translate-y-0 sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              {t.pages.harvest?.createBatch || 'Create Batch'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

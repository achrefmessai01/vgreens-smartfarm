'use client';

import { useI18n } from '@/i18n';
import { Download, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { harvestsLoggedLabel } from '@/lib/harvest-utils';
import type { HarvestSummary } from '@/types/harvest.types';

interface HarvestPageHeaderProps {
  summary: HarvestSummary;
  title: string;
  onCreateBatch?: () => void;
  onExportClick?: () => void;
  /**
   * When provided the Import button is rendered. The page is responsible for
   * only passing this callback when useHarvestImportAvailable() returns true,
   * so the button is hidden for tenants without a mapper configured.
   */
  onImportClick?: () => void;
  isLoading?: boolean;
  /** Sort/filter controls rendered alongside the action buttons. */
  filters?: React.ReactNode;
}

export function HarvestPageHeader({
  summary,
  title,
  onCreateBatch,
  onExportClick,
  onImportClick,
  isLoading = false,
  filters,
}: HarvestPageHeaderProps) {
  const { t, locale } = useI18n();

  return (
    <div className="bg-card rounded-xl border p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight break-words sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {summary.totalHarvests}{' '}
            {harvestsLoggedLabel(
              summary.totalHarvests,
              t.pages.harvest,
              locale,
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {onExportClick && (
            <Button
              onClick={onExportClick}
              disabled={isLoading}
              variant="outline"
              className="group relative w-full overflow-hidden border-[#016f7c]/30 bg-gradient-to-br from-white to-[#016f7c]/[0.03] text-[#016f7c] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:from-[#016f7c]/10 hover:to-[#016f7c]/5 hover:text-[#016f7c] hover:shadow-md sm:w-auto dark:border-teal-300/40 dark:from-[#016f7c]/15 dark:to-[#016f7c]/25 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:from-[#016f7c]/25 dark:hover:to-[#016f7c]/40 dark:hover:text-teal-100 dark:hover:shadow-[0_4px_14px_-2px_rgba(94,234,212,0.25)]"
            >
              <Download className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              {t.pages.harvest?.exportCsv || 'Export CSV'}
            </Button>
          )}

          {/* Import button is only rendered when the parent confirms the tenant
              has a mapper — onImportClick is undefined otherwise. */}
          {onImportClick && (
            <Button
              onClick={onImportClick}
              disabled={isLoading}
              variant="outline"
              className="group relative w-full overflow-hidden border-[#016f7c]/30 bg-gradient-to-br from-white to-[#016f7c]/[0.03] text-[#016f7c] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:from-[#016f7c]/10 hover:to-[#016f7c]/5 hover:text-[#016f7c] hover:shadow-md sm:w-auto dark:border-teal-300/40 dark:from-[#016f7c]/15 dark:to-[#016f7c]/25 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:from-[#016f7c]/25 dark:hover:to-[#016f7c]/40 dark:hover:text-teal-100 dark:hover:shadow-[0_4px_14px_-2px_rgba(94,234,212,0.25)]"
            >
              <Upload className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              {t.pages.harvest?.importExcel || 'Import Data'}
            </Button>
          )}

          {onCreateBatch && (
            <WriteActionButton
              onClick={onCreateBatch}
              disabled={isLoading}
              className="group relative w-full overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:translate-y-0 sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              {t.pages.harvest?.createBatch || 'Create Batch'}
            </WriteActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

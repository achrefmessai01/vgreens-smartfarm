'use client';

import { useI18n } from '@/i18n';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HarvestSummary } from '@/types/harvest.types';

interface HarvestPageHeaderProps {
  summary: HarvestSummary;
  title: string;
  onCreateBatch?: () => void;
  isLoading?: boolean;
}

export function HarvestPageHeader({
  summary,
  title,
  onCreateBatch,
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

        {onCreateBatch && (
          <Button
            onClick={onCreateBatch}
            disabled={isLoading}
            className="w-full bg-green-500 text-white hover:bg-green-600 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.pages.harvest?.createBatch || 'Create Batch'}
          </Button>
        )}
      </div>
    </div>
  );
}

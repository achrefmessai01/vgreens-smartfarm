'use client';

import { useI18n } from '@/i18n';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HarvestSummary } from '@/app/tenant/harvest/harvest.utils';

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {summary.totalHarvests}{' '}
            {t.pages.harvest?.harvestsLogged || 'harvests logged for'}{' '}
            {summary.variety}
          </p>
        </div>

        {onCreateBatch && (
          <Button
            onClick={onCreateBatch}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.pages.harvest?.createBatch || 'Create Batch'}
          </Button>
        )}
      </div>
    </div>
  );
}

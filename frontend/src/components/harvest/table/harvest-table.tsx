'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { groupByBatch, type HarvestItem } from './harvest-table-utils';
import { HarvestTableSkeleton } from './harvest-table-skeleton';
import { HarvestBatchGroup } from './harvest-batch-group';

interface HarvestTableProps {
  harvests: HarvestItem[];
  onDelete?: (harvest: HarvestItem) => void;
  onSidebarEdit?: (harvest: HarvestItem) => void;
  onLogEntry?: (harvest: HarvestItem) => void;
  isLoading?: boolean;
}

export function HarvestTable({
  harvests,
  onDelete,
  onSidebarEdit,
  onLogEntry,
  isLoading = false,
}: HarvestTableProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const groups = React.useMemo(() => groupByBatch(harvests), [harvests]);

  if (isLoading) return <HarvestTableSkeleton />;
  if (groups.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {h?.noHarvestsYet ?? 'No harvests yet'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {h?.logFirstEntryHint ?? 'Create a batch and log your first entry.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <HarvestBatchGroup
          key={group.key}
          group={group}
          onDelete={onDelete}
          onSidebarEdit={onSidebarEdit}
          onLogEntry={onLogEntry}
        />
      ))}
    </div>
  );
}

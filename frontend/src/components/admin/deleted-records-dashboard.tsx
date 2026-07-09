'use client';

import * as React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { TableCell } from '@/components/ui/table';
import { useAdminHistory } from '@/lib/hooks/use-admin-history';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';

function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function deletedByLabel(
  deletedBy?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null,
): string {
  if (!deletedBy) return '—';
  const name = [deletedBy.firstName, deletedBy.lastName].filter(Boolean).join(' ');
  return name || deletedBy.email || '—';
}

export function DeletedRecordsDashboard() {
  const {
    tenantId,
    deletedBatches,
    deletedHarvests,
    batchesLoading,
    harvestsLoading,
    restoringBatch,
    restoringHarvest,
    restoreBatch,
    restoreHarvest,
  } = useAdminHistory();

  const { t } = useI18n();
  const h = t.pages.admin.history;
  const paginationConfig = usePaginationConfig();

  const batchColumns: Column<any>[] = [
    { key: 'batch',       header: h.colBatch },
    { key: 'greenhouse',  header: h.colGreenhouse },
    { key: 'cropVariety', header: h.colCropVariety },
    { key: 'deletedAt',   header: h.colDeletedAt },
    { key: 'deletedBy',   header: h.colDeletedBy },
    { key: 'action',      header: h.colAction, headerClassName: 'text-right' },
  ];

  const harvestColumns: Column<any>[] = [
    { key: 'harvestDate',    header: h.colHarvestDate },
    { key: 'batch',          header: h.colBatch },
    { key: 'greenhouseCrop', header: h.colGreenhouseCrop },
    { key: 'deletedAt',      header: h.colDeletedAt },
    { key: 'deletedBy',      header: h.colDeletedBy },
    { key: 'action',         header: h.colAction, headerClassName: 'text-right' },
  ];

  if (!tenantId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Trash2 className="text-muted-foreground mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">{h.selectTenant}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="batches" className="space-y-4">
      <TabsList>
        <TabsTrigger value="batches">
          {h.batchesTab}
          {deletedBatches.length > 0 && (
            <Badge variant="secondary" className="ml-2">{deletedBatches.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="harvests">
          {h.harvestsTab}
          {deletedHarvests.length > 0 && (
            <Badge variant="secondary" className="ml-2">{deletedHarvests.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="batches" className="space-y-3">
        <p className="text-muted-foreground text-sm">{h.batchesNote}</p>
        <DataTable
          data={deletedBatches}
          columns={batchColumns}
          isLoading={batchesLoading}
          searchConfig={{
            placeholder: h.colBatch,
            onSearch: (query, batch) =>
              (batch.name ?? '').toLowerCase().includes(query.toLowerCase()),
          }}
          emptyState={{ title: h.noBatches }}
          defaultPageSize={paginationConfig.defaultPageSize}
          pageSizeOptions={paginationConfig.pageSizeOptions}
          paginationLabels={paginationConfig.paginationLabels}
          renderRow={(batch) => (
            <>
              <TableCell className="font-medium">
                <div>{batch.name ?? '—'}</div>
                {batch.batchNumber && (
                  <div className="text-muted-foreground font-mono text-xs">{batch.batchNumber}</div>
                )}
              </TableCell>
              <TableCell>{batch.greenhouse?.name ?? '—'}</TableCell>
              <TableCell>
                <div>{batch.crop?.name ?? '—'}</div>
                {batch.variety?.name && (
                  <div className="text-muted-foreground text-xs">{batch.variety.name}</div>
                )}
              </TableCell>
              <TableCell className="text-sm">{formatDate(batch.deletedAt)}</TableCell>
              <TableCell className="text-sm">{deletedByLabel(batch.deletedBy)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreBatch(batch.id)}
                  disabled={restoringBatch}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {h.restore}
                </Button>
              </TableCell>
            </>
          )}
        />
      </TabsContent>

      <TabsContent value="harvests" className="space-y-3">
        <p className="text-muted-foreground text-sm">{h.harvestsNote}</p>
        <DataTable
          data={deletedHarvests}
          columns={harvestColumns}
          isLoading={harvestsLoading}
          searchConfig={{
            placeholder: h.colBatch,
            onSearch: (query, harvest) =>
              (harvest.batch?.name ?? '').toLowerCase().includes(query.toLowerCase()),
          }}
          emptyState={{ title: h.noHarvests }}
          defaultPageSize={paginationConfig.defaultPageSize}
          pageSizeOptions={paginationConfig.pageSizeOptions}
          paginationLabels={paginationConfig.paginationLabels}
          renderRow={(harvest) => (
            <>
              <TableCell className="font-medium">{formatDate(harvest.date)}</TableCell>
              <TableCell>
                <div>{harvest.batch?.name ?? '—'}</div>
                {harvest.batch?.batchNumber && (
                  <div className="text-muted-foreground font-mono text-xs">{harvest.batch.batchNumber}</div>
                )}
              </TableCell>
              <TableCell>
                <div>{harvest.batch?.greenhouse?.name ?? '—'}</div>
                {harvest.batch?.crop?.name && (
                  <div className="text-muted-foreground text-xs">{harvest.batch.crop.name}</div>
                )}
              </TableCell>
              <TableCell className="text-sm">{formatDate(harvest.deletedAt)}</TableCell>
              <TableCell className="text-sm">{deletedByLabel(harvest.deletedBy)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreHarvest(harvest.id)}
                  disabled={restoringHarvest}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {h.restore}
                </Button>
              </TableCell>
            </>
          )}
        />
      </TabsContent>
    </Tabs>
  );
}

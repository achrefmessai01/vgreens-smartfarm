'use client';

import * as React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminHistory } from '@/lib/hooks/use-admin-history';
import { useI18n } from '@/i18n';

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

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
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
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{h.colBatch}</TableHead>
                <TableHead>{h.colGreenhouse}</TableHead>
                <TableHead>{h.colCropVariety}</TableHead>
                <TableHead>{h.colDeletedAt}</TableHead>
                <TableHead>{h.colDeletedBy}</TableHead>
                <TableHead className="text-right">{h.colAction}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchesLoading ? (
                <TableSkeleton cols={6} />
              ) : deletedBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                    {h.noBatches}
                  </TableCell>
                </TableRow>
              ) : (
                deletedBatches.map((batch: any) => (
                  <TableRow key={batch.id}>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="harvests" className="space-y-3">
        <p className="text-muted-foreground text-sm">{h.harvestsNote}</p>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{h.colHarvestDate}</TableHead>
                <TableHead>{h.colBatch}</TableHead>
                <TableHead>{h.colGreenhouseCrop}</TableHead>
                <TableHead>{h.colDeletedAt}</TableHead>
                <TableHead>{h.colDeletedBy}</TableHead>
                <TableHead className="text-right">{h.colAction}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvestsLoading ? (
                <TableSkeleton cols={6} />
              ) : deletedHarvests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                    {h.noHarvests}
                  </TableCell>
                </TableRow>
              ) : (
                deletedHarvests.map((harvest: any) => (
                  <TableRow key={harvest.id}>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

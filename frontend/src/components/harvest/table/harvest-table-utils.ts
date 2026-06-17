'use client';

import { type HarvestsQuery, type BatchesQuery } from '@/generated/graphql';

export type HarvestItem = HarvestsQuery['harvests'][number];
export type BatchItem = BatchesQuery['batches'][number];

export type BatchGroup = {
  key: string;
  batch: BatchItem;
  entries: HarvestItem[];
};

export function getCreatedByLabel(harvest: HarvestItem) {
  if (!harvest.createdBy) return '-';
  const fullName = [harvest.createdBy.firstName, harvest.createdBy.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || harvest.createdBy.email || '-';
}

// Build one group per batch, attaching that batch's harvest events. Batches
// with no harvests yet are still returned (with an empty entries list) so they
// remain visible in the harvest-entry tab.
//
// Group order is intentionally NOT re-sorted here: the `batches` array already
// arrives in the server-applied sort order (see the Batches query's `sort`
// variable), so we preserve it to stay correct under pagination. Only the
// harvest entries *within* a group are ordered (most recent first).
export function groupByBatch(
  batches: BatchItem[],
  harvests: HarvestItem[],
): BatchGroup[] {
  const entriesByBatch = new Map<string, HarvestItem[]>();
  for (const h of harvests) {
    const list = entriesByBatch.get(h.batchId) ?? [];
    list.push(h);
    entriesByBatch.set(h.batchId, list);
  }

  return batches.map((batch) => ({
    key: batch.id,
    batch,
    entries: [...(entriesByBatch.get(batch.id) ?? [])].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    ),
  }));
}

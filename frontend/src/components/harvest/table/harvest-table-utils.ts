'use client';

import { type HarvestsQuery } from '@/generated/graphql';

export type HarvestItem = HarvestsQuery['harvests'][number];

export type BatchGroup = {
  key: string;
  root: HarvestItem;
  entries: HarvestItem[];
};

export function getCreatedByLabel(harvest: HarvestItem) {
  if (!harvest.createdBy) return '-';
  const fullName = [harvest.createdBy.firstName, harvest.createdBy.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || harvest.createdBy.email || '-';
}

// Group harvest events by their parent batch. `root` is a representative
// harvest from which the batch info (harvest.batch) is read.
export function groupByBatch(harvests: HarvestItem[]): BatchGroup[] {
  const groups = new Map<string, HarvestItem[]>();
  for (const item of harvests) {
    const current = groups.get(item.batchId) ?? [];
    current.push(item);
    groups.set(item.batchId, current);
  }

  return [...groups.entries()]
    .map(([key, entries]) => ({
      key,
      root: entries[0],
      entries: entries.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    }))
    .sort((a, b) => +new Date(b.root.date) - +new Date(a.root.date));
}

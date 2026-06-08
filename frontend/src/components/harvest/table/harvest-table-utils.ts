'use client';

import { HarvestStatus, type HarvestsQuery } from '@/generated/graphql';

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

// Only the fields needed to detect an empty auto-draft placeholder. Kept narrow
// so the predicate can be reused by lighter queries (e.g. the export count).
type AutoDraftPlaceholderFields = Pick<
  HarvestItem,
  | 'parentBatchId'
  | 'status'
  | 'classA'
  | 'classB'
  | 'waste'
  | 'avgBrix'
  | 'rowX'
  | 'rowY'
  | 'photos'
>;

export function isAutoDraftPlaceholder(
  entry: AutoDraftPlaceholderFields,
): boolean {
  return (
    !entry.parentBatchId &&
    entry.status === HarvestStatus.Draft &&
    entry.classA === 0 &&
    entry.classB === 0 &&
    entry.waste === 0 &&
    entry.avgBrix === 0 &&
    entry.rowX === 0 &&
    entry.rowY === 0 &&
    entry.photos === 0
  );
}

function getLegacyGroupKey(item: HarvestItem): string {
  const batch = item.batch.trim().toLowerCase();
  const greenhouse = (item.greenhouse ?? '').trim().toLowerCase();
  return `${batch}::${greenhouse}`;
}

export function groupByBatch(harvests: HarvestItem[]): BatchGroup[] {
  const byId = new Map(harvests.map((item) => [item.id, item]));
  const groups = new Map<string, HarvestItem[]>();
  const legacyRootsByKey = new Map<string, HarvestItem>();

  for (const item of harvests) {
    if (item.parentBatchId) continue;
    const legacyKey = getLegacyGroupKey(item);
    const current = legacyRootsByKey.get(legacyKey);
    if (!current || +new Date(item.createdAt) < +new Date(current.createdAt)) {
      legacyRootsByKey.set(legacyKey, item);
    }
  }

  for (const item of harvests) {
    const key =
      item.parentBatchId ??
      legacyRootsByKey.get(getLegacyGroupKey(item))?.id ??
      item.id;
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return [...groups.entries()]
    .map(([key, entries]) => ({
      key,
      root: byId.get(key) ?? entries[0],
      entries: entries.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    }))
    .sort((a, b) => +new Date(b.root.date) - +new Date(a.root.date));
}

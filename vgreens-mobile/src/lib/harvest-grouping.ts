import { HarvestStatus } from '@/generated/graphql';
import type { HarvestLike } from '@/types/harvest-like';

export interface BatchGroup<T extends HarvestLike = HarvestLike> {
  key: string;
  root: T;
  entries: T[];
}

export function getCreatedByLabel<T extends Pick<HarvestLike, 'createdBy'>>(
  h: T,
): string {
  if (!h.createdBy) return '—';
  const name = [h.createdBy.firstName, h.createdBy.lastName]
    .filter(Boolean)
    .join(' ');
  return name || h.createdBy.email || '—';
}

export function isAutoDraftPlaceholder<T extends HarvestLike>(entry: T): boolean {
  return (
    !entry.parentBatchId &&
    entry.status === HarvestStatus.Draft &&
    entry.classA === 0 &&
    entry.waste === 0 &&
    entry.avgBrix === 0 &&
    entry.rowX === 0 &&
    entry.rowY === 0 &&
    entry.photos === 0
  );
}

function legacyGroupKey(item: HarvestLike): string {
  const batch = item.batch.trim().toLowerCase();
  const greenhouse = (item.greenhouse ?? '').trim().toLowerCase();
  return `${batch}::${greenhouse}`;
}

export function groupByBatch<T extends HarvestLike>(
  harvests: T[],
): BatchGroup<T>[] {
  const byId = new Map(harvests.map((h) => [h.id, h]));
  const groups = new Map<string, T[]>();
  const legacyRootsByKey = new Map<string, T>();

  for (const item of harvests) {
    if (item.parentBatchId) continue;
    const key = legacyGroupKey(item);
    const current = legacyRootsByKey.get(key);
    if (!current || +new Date(item.createdAt) < +new Date(current.createdAt)) {
      legacyRootsByKey.set(key, item);
    }
  }

  for (const item of harvests) {
    const key =
      item.parentBatchId ??
      legacyRootsByKey.get(legacyGroupKey(item))?.id ??
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

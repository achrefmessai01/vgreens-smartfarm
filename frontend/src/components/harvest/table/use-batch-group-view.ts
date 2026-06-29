import * as React from 'react';
import { useI18n } from '@/i18n';
import { classLetter } from '@/lib/harvest-utils';
import {
  aggregateBatchTotals,
  type BatchGroup,
} from './harvest-table-utils';

/**
 * Shared view model for a single batch group. Owns the heavy aggregation work
 * (so child sub-components don't recompute it) and exposes the i18n / styling
 * helpers every layout — collapsed table, collapsed mobile card, expanded
 * table, expanded mobile cards — needs to render a row.
 *
 * Keep this hook pure and read-only: no callbacks, no event wiring. That stays
 * in `<HarvestBatchGroup>` where the click/keyboard handlers live, so the
 * sub-components only depend on data + a small set of helpers.
 */
export function useBatchGroupView(group: BatchGroup) {
  const { t, locale } = useI18n();
  const h = t.pages.harvest;
  const entries = group.entries;
  const batch = group.batch;

  const agg = React.useMemo(
    () => aggregateBatchTotals(entries, batch),
    [entries, batch],
  );

  const classIdxs = React.useMemo(
    () => agg.classKgs.map((_, i) => i),
    [agg.classKgs],
  );

  const classLabelTpl = h?.qualityClassLabel ?? 'Quality {class}';
  const classLabel = (i: number) =>
    classLabelTpl.replace('{class}', classLetter(i));

  return {
    h,
    locale,
    entries,
    batch,
    agg,
    classIdxs,
    classLabel,
    classColor,
    classKgAt,
    wasteLabel: h?.waste ?? 'Waste',
    totalLabel: h?.batchTotal ?? 'Batch total',
  };
}

export type BatchGroupView = ReturnType<typeof useBatchGroupView>;

// Class index -> tailwind text color. Cycles past the 5 known classes so an
// unexpectedly wide batch still renders.
const CLASS_COLORS = [
  'text-green-600',
  'text-teal-600',
  'text-amber-600',
  'text-blue-600',
  'text-purple-600',
];
const classColor = (i: number) => CLASS_COLORS[i % CLASS_COLORS.length];
const classKgAt = (kgs: number[] | null | undefined, i: number) =>
  kgs?.[i] ?? 0;

import { HarvestSortField, OrderDirection } from '@common/enums';
import type { BatchSortInput } from '../dto/batch-sort.input';

// Default order when no sort is supplied: newest planting first. Mirrors the
// previously hardcoded `batch.plantingDate DESC, batch.createdAt DESC`.
export const DEFAULT_BATCH_SORT_FIELD = HarvestSortField.PLANTING_DATE;
export const DEFAULT_BATCH_SORT_DIRECTION = OrderDirection.DESC;

export interface OrderClause {
  // QueryBuilder order expression, e.g. `LOWER(crop.name)` or `batch.plantingDate`.
  expression: string;
  direction: OrderDirection;
  // Postgres NULLS placement; names (greenhouse) may be null so we keep them last.
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
}

// Name columns are sorted case-insensitively so "apple" and "Apple" group
// together. LOWER() is the portable, collation-independent equivalent of a
// locale-aware localeCompare for the ASCII/Latin crop & greenhouse names here.
const FIELD_EXPRESSIONS: Record<HarvestSortField, string> = {
  [HarvestSortField.CROP]: 'LOWER(crop.name)',
  [HarvestSortField.GREENHOUSE]: 'LOWER(greenhouse.name)',
  [HarvestSortField.PLANTING_DATE]: 'batch.plantingDate',
  [HarvestSortField.NAME]: 'LOWER(batch.name)',
  [HarvestSortField.MANUAL_ORDER]: 'batch.sortOrder',
};

/**
 * Build the ordered list of ORDER BY clauses for the batch list given a sort
 * selection. Produces a deterministic order with stable tie-breakers:
 *
 *  - PLANTING_DATE primary  -> tie-break by crop name (asc), then createdAt desc
 *  - CROP / GREENHOUSE prim. -> tie-break by plantingDate desc, then createdAt desc
 *
 * Nullable name columns (greenhouse) are always placed last regardless of
 * direction. `batch.id` is appended as a final, fully-deterministic tiebreaker
 * so pagination stays stable.
 */
export function buildBatchOrderBy(sort?: BatchSortInput | null): OrderClause[] {
  const field = sort?.field ?? DEFAULT_BATCH_SORT_FIELD;
  // MANUAL_ORDER is the user's saved drag-and-drop rank: it is meaningful only
  // ascending (0,1,2,…), so ignore any client direction and pin it ASC. Batches
  // with no saved rank (null sortOrder) fall to the end via NULLS LAST below.
  const direction =
    field === HarvestSortField.MANUAL_ORDER
      ? OrderDirection.ASC
      : (sort?.direction ?? DEFAULT_BATCH_SORT_DIRECTION);

  const primary: OrderClause = {
    expression: FIELD_EXPRESSIONS[field],
    direction,
    nulls: 'NULLS LAST',
  };

  const clauses: OrderClause[] = [primary];

  if (field === HarvestSortField.PLANTING_DATE) {
    // Equal planting dates -> secondary sort by crop name (spec requirement).
    clauses.push({
      expression: FIELD_EXPRESSIONS[HarvestSortField.CROP],
      direction: OrderDirection.ASC,
      nulls: 'NULLS LAST',
    });
  } else {
    // CROP / GREENHOUSE / NAME / MANUAL_ORDER: break ties by newest planting first.
    clauses.push({
      expression: 'batch.plantingDate',
      direction: OrderDirection.DESC,
    });
  }

  clauses.push({
    expression: 'batch.createdAt',
    direction: OrderDirection.DESC,
  });
  clauses.push({ expression: 'batch.id', direction: OrderDirection.ASC });

  return clauses;
}

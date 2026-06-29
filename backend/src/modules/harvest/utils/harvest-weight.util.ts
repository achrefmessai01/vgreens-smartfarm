import { InputMode } from '@common/enums';
import { sum } from '@common/utils';
import type { Batch } from '@modules/batch/entities/batch.entity';
import type { HarvestEntry } from '../entities/harvest-entry.entity';

// All weight derivation for a harvest lives here so the two input modes (direct
// kg vs crate counts) and the dynamic, unbounded quality-class arrays can never
// drift apart. Every total/breakdown in the service is built from these.

// True when the parent batch records harvests as crates (counts + remainder)
// rather than direct kg per class.
export function isCrateMode(batch?: Batch | null): boolean {
  return batch?.inputMode === InputMode.CRATE;
}

// Number of quality classes an entry carries (per-entry, dynamic, unbounded) —
// the length of whichever array is authoritative for the batch's mode.
export function entryClassCount(e: HarvestEntry, batch?: Batch | null): number {
  return isCrateMode(batch)
    ? (e.crateCounts?.length ?? 0)
    : (e.classKgs?.length ?? 0);
}

// Crate-mode sellable kg summed across ALL classes:
// Σ (crateCount[i] × crateWeight + remainingKg[i]). Handles ragged arrays by
// spanning the widest of counts/remainders. crateWeight is passed in so callers
// read it live off the batch — a crateWeight edit re-derives every crate entry.
export function sumCrateWeights(
  crateCounts: number[] | null | undefined,
  remainingKgs: number[] | null | undefined,
  crateWeight: number,
): number {
  const n = Math.max(crateCounts?.length ?? 0, remainingKgs?.length ?? 0);
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += (crateCounts?.[i] ?? 0) * crateWeight + (remainingKgs?.[i] ?? 0);
  }
  return total;
}

// The crate weight to derive crate-mode kg from. Prefers the explicitly resolved
// value (the harvest's selected crate); falls back to the legacy batch.crateWeight
// so callers that don't yet pass a crate weight behave exactly as before.
function resolveCrateWeight(
  batch?: Batch | null,
  crateWeight?: number | null,
): number {
  return crateWeight ?? batch?.crateWeight ?? 0;
}

// One entry resolved to its per-class sellable kg array (waste excluded), in
// either mode. The single source of the per-class breakdown; class totals are
// built by summing these element-wise across entries. crateWeight overrides the
// batch's legacy crateWeight (the harvest's selected crate drives derivation).
export function entryClassWeights(
  e: HarvestEntry,
  batch?: Batch | null,
  crateWeight?: number | null,
): number[] {
  if (isCrateMode(batch)) {
    const weight = resolveCrateWeight(batch, crateWeight);
    const n = entryClassCount(e, batch);
    return Array.from(
      { length: n },
      (_, i) => (e.crateCounts?.[i] ?? 0) * weight + (e.remainingKgs?.[i] ?? 0),
    );
  }
  return [...(e.classKgs ?? [])];
}

// Sellable weight of one entry: the sum across all quality classes, either mode.
// Excludes waste.
export function entrySellableWeight(
  e: HarvestEntry,
  batch?: Batch | null,
  crateWeight?: number | null,
): number {
  return isCrateMode(batch)
    ? sumCrateWeights(
        e.crateCounts,
        e.remainingKgs,
        resolveCrateWeight(batch, crateWeight),
      )
    : sum(e.classKgs ?? []);
}

// Total weight of one entry = sellable across all classes + waste. Waste counts
// toward the harvest weight (it stays tracked separately as `waste`); nothing is
// deducted.
export function entryTotalWeight(
  e: HarvestEntry,
  batch?: Batch | null,
  crateWeight?: number | null,
): number {
  return entrySellableWeight(e, batch, crateWeight) + (e.waste ?? 0);
}

// Harvest-level total fruit weight: Σ entry totals (sellable + waste), dynamic
// over any number of classes and either input mode. The one weight to use
// everywhere a harvest's mass is needed.
export function totalFruitWeight(
  entries: HarvestEntry[] | undefined,
  batch?: Batch | null,
  crateWeight?: number | null,
): number {
  return sum(
    (entries ?? []).map((e) => entryTotalWeight(e, batch, crateWeight)),
  );
}

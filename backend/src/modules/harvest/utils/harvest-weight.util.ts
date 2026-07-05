import { InputMode } from '@common/enums';
import { sum } from '@common/utils';
import type { HarvestEntry } from '../entities/harvest-entry.entity';

// All weight derivation for a harvest lives here so the two input modes (direct
// kg vs crate counts) and the dynamic, unbounded quality-class arrays can never
// drift apart. Every total/breakdown in the service is built from these.
//
// The mode is per-HARVEST (harvest.inputMode) — callers pass the owning
// harvest's mode, never a batch-level one; a single batch can hold harvests in
// different modes.

// True when the harvest records yield as crates (counts + remainder) rather
// than direct kg per class.
export function isCrateMode(inputMode?: InputMode | null): boolean {
  return inputMode === InputMode.CRATE;
}

// Number of quality classes an entry carries (per-entry, dynamic, unbounded) —
// the length of whichever array is authoritative for the harvest's mode.
export function entryClassCount(
  e: HarvestEntry,
  inputMode?: InputMode | null,
): number {
  return isCrateMode(inputMode)
    ? (e.crateCounts?.length ?? 0)
    : (e.classKgs?.length ?? 0);
}

// Crate-mode sellable kg summed across ALL classes:
// Σ (crateCount[i] × crateWeight + remainingKg[i]). Handles ragged arrays by
// spanning the widest of counts/remainders. crateWeight is passed in so callers
// read it live off the harvest's crate — a crate change re-derives every entry.
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

// One entry resolved to its per-class sellable kg array (waste excluded), in
// either mode. The single source of the per-class breakdown; class totals are
// built by summing these element-wise across entries.
export function entryClassWeights(
  e: HarvestEntry,
  inputMode?: InputMode | null,
  crateWeight?: number | null,
): number[] {
  if (isCrateMode(inputMode)) {
    const weight = crateWeight ?? 0;
    const n = entryClassCount(e, inputMode);
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
  inputMode?: InputMode | null,
  crateWeight?: number | null,
): number {
  return isCrateMode(inputMode)
    ? sumCrateWeights(e.crateCounts, e.remainingKgs, crateWeight ?? 0)
    : sum(e.classKgs ?? []);
}

// Total weight of one entry = sellable across all classes + waste. Waste counts
// toward the harvest weight (it stays tracked separately as `waste`); nothing is
// deducted.
export function entryTotalWeight(
  e: HarvestEntry,
  inputMode?: InputMode | null,
  crateWeight?: number | null,
): number {
  return entrySellableWeight(e, inputMode, crateWeight) + (e.waste ?? 0);
}

// Harvest-level total fruit weight: Σ entry totals (sellable + waste), dynamic
// over any number of classes and either input mode. The one weight to use
// everywhere a harvest's mass is needed.
export function totalFruitWeight(
  entries: HarvestEntry[] | undefined,
  inputMode?: InputMode | null,
  crateWeight?: number | null,
): number {
  return sum(
    (entries ?? []).map((e) => entryTotalWeight(e, inputMode, crateWeight)),
  );
}

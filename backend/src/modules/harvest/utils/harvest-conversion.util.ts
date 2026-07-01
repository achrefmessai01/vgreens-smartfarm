import { roundTo } from '@common/utils';

// Lossless conversion of an entry's per-class arrays between the two input modes.
// Both directions preserve array LENGTH and index (index = quality-class identity,
// 0=A, 1=B, ...): one output slot per input class, including zero-value classes —
// never compacted, dropped, or reordered. Empty/non-numeric cells count as 0.
//
// Crate remainders (and the kg reconstructed from them) are rounded to 3 decimals
// (gram resolution) so a weight -> crate -> weight round-trip stays stable.

const REMAINDER_DECIMALS = 3;

function finite(value: number | null | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0;
}

// Weight -> crate. For each class: how many full crates the kg fills, plus the
// leftover kg. The remainder is derived FROM the crate count (kg − count·cw), not
// rounded independently, so count·cw + remainder reconstructs the original kg.
// `crateWeight` must be > 0 (validated by the caller).
export function weightToCrate(
  classKgs: readonly (number | null | undefined)[],
  crateWeight: number,
): { crateCounts: number[]; remainingKgs: number[] } {
  const crateCounts: number[] = [];
  const remainingKgs: number[] = [];
  for (const raw of classKgs) {
    const kg = finite(raw);
    const count = Math.floor(kg / crateWeight);
    crateCounts.push(count);
    remainingKgs.push(roundTo(kg - count * crateWeight, REMAINDER_DECIMALS));
  }
  return { crateCounts, remainingKgs };
}

// Crate -> weight. For each class: count·cw + remainder, rounded to the same
// precision as the stored remainder so repeated round-trips don't drift. Spans
// the widest of the two input arrays (ragged inputs zero-fill the shorter).
// `crateWeight` must be > 0 (validated by the caller).
export function crateToWeight(
  crateCounts: readonly (number | null | undefined)[],
  remainingKgs: readonly (number | null | undefined)[],
  crateWeight: number,
): { classKgs: number[] } {
  const n = Math.max(crateCounts.length, remainingKgs.length);
  const classKgs: number[] = [];
  for (let i = 0; i < n; i++) {
    const count = finite(crateCounts[i]);
    const remainder = finite(remainingKgs[i]);
    classKgs.push(
      roundTo(count * crateWeight + remainder, REMAINDER_DECIMALS),
    );
  }
  return { classKgs };
}

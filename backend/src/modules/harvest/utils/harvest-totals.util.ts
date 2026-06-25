import { InputMode } from '@common/enums';
import { roundTo, sum, sumByIndex, weightedMean } from '@common/utils';
import type { Batch } from '@modules/batch/entities/batch.entity';
import type { HarvestEntry } from '../entities/harvest-entry.entity';
import type { HarvestTotals } from '../dto/harvest-totals.dto';
import { entryClassWeights, totalFruitWeight } from './harvest-weight.util';

// Derive a harvest's totals from its entries (+ parent batch for the yields).
// Pure: all weight derivation flows through the harvest-weight util, so both
// input modes and any number of quality classes are handled in one place.
//
// avgFruitWeight and avgBrix are SAMPLE-WEIGHTED means (by sampleFruitCount), so
// a larger sample counts proportionally more. fruitCount is the SUM of the
// per-entry sampleFruitCount — fruits SAMPLED, not an estimate of fruits
// harvested. totalFruitWeight INCLUDES waste.
export function computeHarvestTotals(
  entries: HarvestEntry[] | undefined,
  batch?: Batch | null,
): HarvestTotals {
  const list = entries ?? [];

  // Per-class sellable kg (waste excluded): the per-entry class arrays summed
  // element-wise into one positional array (index 0=A, 1=B, ...), as wide as the
  // widest entry. Dynamic and unbounded — no fixed A/B/C.
  const classKgs = sumByIndex(list.map((e) => entryClassWeights(e, batch))).map(
    (kg) => roundTo(kg, 3),
  );

  const waste = roundTo(sum(list.map((e) => e.waste ?? 0)), 3);
  // Total harvested weight = sellable across all classes + waste. Waste counts
  // toward the weight and is still reported separately above.
  const totalWeight = roundTo(totalFruitWeight(list, batch), 3);

  // Total fruits SAMPLED across the entries — not an estimate of fruits harvested.
  const fruitCount = sum(list.map((e) => e.sampleFruitCount ?? 0));

  // Per-class crate counts, summed element-wise the same way. Crate-mode only —
  // null otherwise so the field reflects "not applicable".
  const isCrate = batch?.inputMode === InputMode.CRATE;
  const crateCounts = isCrate
    ? sumByIndex(list.map((e) => e.crateCounts ?? []))
    : null;

  // Sample-weighted g/fruit: pooled sample mass / pooled sample fruit count
  // (= per-entry g/fruit weighted by each entry's fruit count). Only entries
  // with a complete sample contribute. Null when none do.
  const sampled = list.filter(
    (e) => (e.sampleWeight ?? 0) > 0 && (e.sampleFruitCount ?? 0) > 0,
  );
  const sampledFruit = sum(sampled.map((e) => e.sampleFruitCount ?? 0));
  const avgFruitWeight =
    sampledFruit > 0
      ? roundTo(sum(sampled.map((e) => e.sampleWeight ?? 0)) / sampledFruit, 3)
      : null;

  // Sample-weighted mean brix across entries that carry a reading (avgBrix > 0),
  // weighted by sampleFruitCount. Null when none do.
  const brixEntries = list.filter((e) => (e.avgBrix ?? 0) > 0);
  const avgBrix =
    brixEntries.length > 0
      ? roundTo(
          weightedMean(
            brixEntries.map((e) => e.avgBrix),
            brixEntries.map((e) => e.sampleFruitCount ?? 0),
          ),
          1,
        )
      : null;

  // Yields divide by living plants (planted − lost) and the row lengths.
  // Null-safe: never divide by a zero/missing denominator.
  const livingPlants = batch?.livingPlants ?? 0;
  const rowLength = batch?.rowLength ?? 0;
  const runningMeter = batch?.runningMeter ?? 0;
  const yieldPerPlant =
    livingPlants > 0 ? roundTo(totalWeight / livingPlants, 3) : null;
  const yieldPerMeter =
    rowLength > 0 ? roundTo(totalWeight / rowLength, 3) : null;
  const yieldPerRunningMeter =
    runningMeter > 0 ? roundTo(totalWeight / runningMeter, 3) : null;

  return {
    classKgs,
    waste,
    fruitCount,
    totalFruitWeight: totalWeight,
    crateCounts,
    avgFruitWeight,
    avgBrix,
    yieldPerPlant,
    yieldPerMeter,
    yieldPerRunningMeter,
  };
}

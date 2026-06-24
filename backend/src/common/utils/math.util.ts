// Small, dependency-free numeric helpers shared across modules. Kept pure so
// any service can reuse them without pulling in domain types.

// Round to a fixed number of decimals (half-up). roundTo(1.2345, 3) -> 1.235.
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Plain sum of a numeric array; missing/NaN entries count as 0. Empty -> 0.
export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

// Arithmetic (unweighted) mean. Empty -> 0.
export function mean(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

// Weighted mean: Σ(value × weight) / Σ(weight). Falls back to the unweighted
// mean when every weight is 0/absent, so a metric never collapses to 0 just
// because no weights were supplied. `values` and `weights` are paired by index.
export function weightedMean(values: number[], weights: number[]): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < values.length; i++) {
    const w = weights[i] ?? 0;
    if (!Number.isFinite(values[i]) || w <= 0) continue;
    weightedSum += values[i] * w;
    totalWeight += w;
  }
  if (totalWeight > 0) return weightedSum / totalWeight;
  return mean(values);
}

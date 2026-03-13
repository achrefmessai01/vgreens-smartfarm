import type { BatchDetailsData } from '@/components/harvest/batch-sidebar-types';

export function computeAvgBrix(
  brix: BatchDetailsData['brixMeasurements'],
): number {
  const values = [
    brix.brix1,
    brix.brix2,
    brix.brix3,
    brix.brix4,
    brix.brix5,
    brix.brix6,
    brix.brix7,
    brix.brix8,
    brix.brix9,
    brix.brix10,
  ].filter((v) => v > 0);

  if (values.length === 0) return 0;

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

export function extractStoragePathFromUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/,
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

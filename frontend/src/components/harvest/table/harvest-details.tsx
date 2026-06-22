'use client';

import { useI18n } from '@/i18n';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet';
import {
  classLetter,
  crateClassKg,
  formatHarvestDate,
  getGreenhouseLabel,
  harvestToDisplayEntries,
} from '@/lib/harvest-utils';
import { InputMode, type HarvestsQuery } from '@/generated/graphql';

type HarvestItem = HarvestsQuery['harvests'][number];

interface HarvestDetailsProps {
  harvest: HarvestItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HarvestDetails({
  harvest,
  open,
  onOpenChange,
}: HarvestDetailsProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  if (!harvest) return null;

  const totals = harvest.totals;
  const greenhouseName = harvest.batch?.greenhouse?.name ?? null;
  const classLabelTpl = h?.qualityClassLabel ?? 'Quality {class}';
  const wasteLabel = h?.waste ?? 'Waste';
  const ratioLabel = h?.wasteRatio ?? 'Waste Ratio';
  // Per sub-entry breakdown; legacy harvests synthesize a single entry.
  const entries = harvestToDisplayEntries(harvest);
  const showEntryLabels = entries.length > 1;
  // In crate mode the stored classA/B/C are 0; per-class kg are derived from the
  // crate counts + the batch crate weight at display time, across a dynamic
  // number of classes.
  const isCrate = harvest.batch?.inputMode === InputMode.Crate;
  const crateWeight = harvest.batch?.crateWeight ?? null;
  const cratesLabel = h?.cratesUnit ?? 'crates';
  // Total yield = sellable + waste. Crate mode sums all classes via the
  // service-computed totalFruitWeight; weight mode uses the A/B/C scalars.
  const totalYield = isCrate
    ? totals.totalFruitWeight + totals.waste
    : totals.classA + totals.classB + totals.classC + totals.waste;
  // A muted color cycle for the per-class value labels.
  const classColors = [
    'text-green-600',
    'text-teal-600',
    'text-amber-600',
    'text-blue-600',
    'text-purple-600',
  ];
  // "12 × 8 kg + 3.5 kg" caption for a crate-mode class; omitted when empty.
  const crateBreakdownText = (
    count: number,
    remainder: number,
  ): string | null => {
    if (!isCrate) return null;
    const parts: string[] = [];
    if (count > 0) parts.push(`${count} × ${crateWeight ?? 0} kg`);
    if (remainder > 0) parts.push(`${remainder} kg`);
    return parts.length > 0 ? parts.join(' + ') : null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="from-background to-muted/20 border-b bg-gradient-to-r px-6 pt-6 pb-4">
          <SheetTitle className="text-xl font-bold">
            {h?.harvestDetails ?? 'Harvest Details'} -{' '}
            {getGreenhouseLabel(greenhouseName)}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="text-foreground mb-4 text-xl font-bold">
                {h?.summary ?? 'Summary'}
              </h3>
              <div className="space-y-4">
                <DetailRow
                  label={h?.date ?? 'Date'}
                  value={formatHarvestDate(harvest.date)}
                />
                <DetailRow
                  label={h?.batch ?? 'Batch'}
                  value={harvest.batch?.name ?? '-'}
                />
                {harvest.batch?.batchNumber && (
                  <DetailRow
                    label={h?.batchNumber ?? 'Batch Number'}
                    value={harvest.batch.batchNumber}
                    valueClassName="font-mono"
                  />
                )}
                <DetailRow
                  label={h?.greenhouse ?? 'Greenhouse'}
                  value={getGreenhouseLabel(greenhouseName)}
                  valueClassName="text-blue-600"
                />
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground font-medium">
                    {h?.totalYield ?? 'Total Yield'}:
                  </span>
                  <span className="text-xl font-bold text-teal-600">
                    {totalYield.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            {entries.map((entry, entryIndex) => {
              const counts = entry.crateCounts ?? [];
              const rems = entry.remainingKgs ?? [];
              // Per-class rows, dynamic in both modes. Crate mode: kg derived
              // from count × crateWeight + remainder, with a breakdown caption.
              // Weight mode: the stored per-class kg.
              const classRows = isCrate
                ? counts.map((count, i) => ({
                    label: classLabelTpl.replace('{class}', classLetter(i)),
                    kg: crateClassKg(count, rems[i] ?? 0, crateWeight),
                    breakdown: crateBreakdownText(count, rems[i] ?? 0),
                  }))
                : (entry.classKgs ?? []).map((kg, i) => ({
                    label: classLabelTpl.replace('{class}', classLetter(i)),
                    kg,
                    breakdown: null,
                  }));
              const sellable = classRows.reduce((s, r) => s + r.kg, 0);
              const entryTotal = sellable + entry.waste;
              const entryRatio =
                entryTotal > 0 ? (entry.waste / entryTotal) * 100 : 0;
              const totalCrates = counts.reduce((s, c) => s + (c ?? 0), 0);
              // Average fruit weight (g/fruit) comes from the weighed sample.
              const displayAvgFruitWeight =
                entry.sampleWeight != null &&
                entry.sampleWeight > 0 &&
                entry.sampleFruitCount != null &&
                entry.sampleFruitCount > 0
                  ? entry.sampleWeight / entry.sampleFruitCount
                  : null;
              const hasFruitWeight = displayAvgFruitWeight != null;
              return (
                <div
                  key={entryIndex}
                  className="bg-card space-y-6 rounded-lg border p-6 shadow-sm"
                >
                  {showEntryLabels && (
                    <h3 className="text-foreground text-lg font-bold">
                      {(h?.entryLabel ?? 'Entry {n}').replace(
                        '{n}',
                        String(entryIndex + 1),
                      )}
                    </h3>
                  )}

                  <div>
                    <h4 className="text-foreground mb-4 font-semibold">
                      {h?.harvestBreakdown ?? 'Harvest Breakdown'}
                    </h4>
                    <div className="space-y-4">
                      {classRows.map((row, i) => (
                        <QualityRow
                          key={i}
                          label={row.label}
                          kg={row.kg}
                          breakdown={row.breakdown}
                          valueClassName={classColors[i % classColors.length]}
                        />
                      ))}
                      {isCrate && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-muted-foreground font-medium">
                            {h?.totalCrates ?? 'Total crates'}:
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {totalCrates} {cratesLabel}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground font-medium">
                          {wasteLabel}:
                        </span>
                        <span className="text-xl font-bold text-red-500">
                          {entry.waste} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground font-medium">
                          {ratioLabel}:
                        </span>
                        <span className="bg-muted rounded px-3 py-1 text-sm font-medium">
                          {entryRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-foreground font-semibold">
                        {h?.brixMeasurements ?? 'Brix Measurements'}
                      </h4>
                      <span className="text-muted-foreground text-sm">
                        {h?.average ?? 'Average'}:{' '}
                        <span className="text-lg font-medium text-orange-500">
                          {entry.avgBrix}°Bx
                        </span>
                      </span>
                    </div>
                    {entry.brixReadings.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No Brix readings recorded.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                        {entry.brixReadings.map((reading, index) => (
                          <div key={index} className="text-center">
                            <div className="text-muted-foreground mb-2 text-xs font-medium">
                              #{index + 1} &middot; {reading.class}
                            </div>
                            <div className="bg-muted rounded-lg border p-4">
                              <span className="text-foreground text-lg font-bold">
                                {reading.value.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-foreground font-semibold">
                        {h?.fruitWeightMeasurement ?? 'Fruit Weight'}
                      </h4>
                      <span className="text-muted-foreground text-sm">
                        {h?.averageFruitWeight ?? 'Average Fruit Weight'}:{' '}
                        <span className="text-lg font-medium text-orange-500">
                          {hasFruitWeight
                            ? `${displayAvgFruitWeight.toFixed(1)} g`
                            : '—'}
                        </span>
                      </span>
                    </div>
                    {!hasFruitWeight ? (
                      <p className="text-muted-foreground text-sm">
                        {h?.noFruitWeightRecorded ??
                          'No fruit weight recorded.'}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {entry.sampleFruitCount != null &&
                          entry.sampleWeight != null && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-muted-foreground font-medium">
                                {h?.fruitWeightSample ?? 'Fruit weight sample'}:
                              </span>
                              <span className="text-foreground text-lg font-bold">
                                {entry.sampleWeight.toFixed(1)} g /{' '}
                                {entry.sampleFruitCount}{' '}
                                {h?.sampleFruitCountUnit ?? 'fruits'}
                              </span>
                            </div>
                          )}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground font-medium">
                            {h?.totalWeight ?? 'Total weight'}:
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {sellable.toFixed(2)} kg
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// One quality line in the per-entry breakdown. `breakdown` is the crate-mode
// "12 × 8 kg + 3.5 kg" caption (null in weight mode).
function QualityRow({
  label,
  kg,
  breakdown,
  valueClassName,
}: {
  label: string;
  kg: number;
  breakdown: string | null;
  valueClassName: string;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium">{label}:</span>
        <span className={`text-xl font-bold ${valueClassName}`}>
          {kg.toFixed(1)} kg
        </span>
      </div>
      {breakdown && (
        <p className="text-muted-foreground mt-1 text-right text-xs">
          {breakdown}
        </p>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="border-muted/30 flex items-center justify-between border-b py-2">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className={`font-semibold ${valueClassName ?? 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

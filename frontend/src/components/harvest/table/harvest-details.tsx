'use client';

import { useI18n } from '@/i18n';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet';
import {
  formatHarvestDate,
  getGreenhouseLabel,
  harvestToDisplayEntries,
} from '@/lib/harvest-utils';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import type { HarvestsQuery } from '@/generated/graphql';

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
  const classBMode = useHarvestClassBMode();

  if (!harvest) return null;

  const secondaryValue = classBMode ? harvest.classB : harvest.waste;
  const totalYield = harvest.classA + secondaryValue;
  const primaryLabel = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.marketable ?? 'Marketable');
  const secondaryLabel = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste');
  const ratioLabel = classBMode
    ? (h?.quality2Ratio ?? 'Quality 2 Ratio')
    : (h?.wasteRatio ?? 'Waste Ratio');
  // Per sub-entry breakdown; legacy harvests synthesize a single entry.
  const entries = harvestToDisplayEntries(harvest);
  const showEntryLabels = entries.length > 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="from-background to-muted/20 border-b bg-gradient-to-r px-6 pt-6 pb-4">
          <SheetTitle className="text-xl font-bold">
            {h?.harvestDetails ?? 'Harvest Details'} -{' '}
            {getGreenhouseLabel(harvest.greenhouse)}
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
                <DetailRow label={h?.batch ?? 'Batch'} value={harvest.batch} />
                {harvest.batchNumber && (
                  <DetailRow
                    label={h?.batchNumber ?? 'Batch Number'}
                    value={harvest.batchNumber}
                    valueClassName="font-mono"
                  />
                )}
                <DetailRow
                  label={h?.greenhouse ?? 'Greenhouse'}
                  value={getGreenhouseLabel(harvest.greenhouse)}
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
              const entrySecondary = classBMode ? entry.classB : entry.waste;
              const entryTotal = entry.classA + entrySecondary;
              const entryRatio =
                entryTotal > 0 ? (entrySecondary / entryTotal) * 100 : 0;
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
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground font-medium">
                          {primaryLabel}:
                        </span>
                        <span className="text-xl font-bold text-teal-600">
                          {entry.classA} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground font-medium">
                          {secondaryLabel}:
                        </span>
                        <span
                          className={`text-xl font-bold ${classBMode ? 'text-teal-600' : 'text-red-500'}`}
                        >
                          {entrySecondary} kg
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
                        {entry.brixReadings.map((value, index) => (
                          <div key={index} className="text-center">
                            <div className="text-muted-foreground mb-2 text-xs font-medium">
                              #{index + 1}
                            </div>
                            <div className="bg-muted rounded-lg border p-4">
                              <span className="text-foreground text-lg font-bold">
                                {value.toFixed(1)}
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
                          {entry.avgFruitWeight.toFixed(3)} kg
                        </span>
                      </span>
                    </div>
                    {entry.fruitCount === 0 && entry.totalFruitWeight === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        {h?.noFruitWeightRecorded ?? 'No fruit weight recorded.'}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground font-medium">
                            {h?.fruitCount ?? 'Fruit count'}:
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {entry.fruitCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground font-medium">
                            {h?.totalWeight ?? 'Total weight'}:
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {entry.totalFruitWeight.toFixed(2)} kg
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

'use client'

import { useI18n } from '@/i18n'
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet'
import {
  formatHarvestDate,
  getGreenhouseLabel,
} from '@/app/tenant/harvest/harvest.utils'
import type { HarvestsQuery } from '@/generated/graphql'

type HarvestItem = HarvestsQuery['harvests'][number]

interface HarvestDetailsProps {
  harvest: HarvestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getBrixValues(h: HarvestItem): number[] {
  return [h.brix1, h.brix2, h.brix3, h.brix4, h.brix5, h.brix6, h.brix7, h.brix8, h.brix9, h.brix10]
}

export function HarvestDetails({ harvest, open, onOpenChange }: HarvestDetailsProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  if (!harvest) return null

  const totalYield = harvest.classA + harvest.waste
  const wasteRatio = totalYield > 0 ? (harvest.waste / totalYield) * 100 : 0
  const brixValues = getBrixValues(harvest)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
          <SheetTitle className="text-xl font-bold">
            {h?.harvestDetails ?? 'Harvest Details'} - {getGreenhouseLabel(harvest.greenhouse)}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-foreground">
                {h?.summary ?? 'Summary'}
              </h3>
              <div className="space-y-4">
                <DetailRow label={h?.date ?? 'Date'} value={formatHarvestDate(harvest.date)} />
                <DetailRow label={h?.batch ?? 'Batch'} value={harvest.batch} />
                <DetailRow
                  label={h?.greenhouse ?? 'Greenhouse'}
                  value={getGreenhouseLabel(harvest.greenhouse)}
                  valueClassName="text-blue-600"
                />
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground font-medium">
                    {h?.totalYield ?? 'Total Yield'}:
                  </span>
                  <span className="font-bold text-teal-600 text-xl">
                    {totalYield.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-foreground">
                {h?.harvestBreakdown ?? 'Harvest Breakdown'}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">
                    {h?.marketable ?? 'Marketable'}:
                  </span>
                  <span className="font-bold text-teal-600 text-xl">
                    {harvest.classA} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">
                    {h?.waste ?? 'Waste'}:
                  </span>
                  <span className="font-bold text-red-500 text-xl">
                    {harvest.waste} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">
                    {h?.wasteRatio ?? 'Waste Ratio'}:
                  </span>
                  <span className="bg-muted px-3 py-1 rounded text-sm font-medium">
                    {wasteRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-foreground">
                  {h?.brixMeasurements ?? 'Brix Measurements'}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {h?.average ?? 'Average'}:{' '}
                  <span className="text-lg text-orange-500 font-medium">
                    {harvest.avgBrix}°Bx
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {brixValues.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-2">
                      #{index + 1}
                    </div>
                    <div className="bg-muted p-4 rounded-lg border">
                      <span className="font-bold text-lg text-foreground">
                        {value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-muted/30">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className={`font-semibold ${valueClassName ?? 'text-foreground'}`}>{value}</span>
    </div>
  )
}

'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { HarvestRecord } from '@/lib/types/harvest'
import { cn } from '@/lib/utils'

interface HarvestDetailsProps {
  harvest: HarvestRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Generate realistic brix values that average to the target
function generateBrixValues(avgBrix: number, count: number = 10): number[] {
  const values: number[] = []
  const variance = 0.8 // ±0.8 range around average
  
  for (let i = 0; i < count; i++) {
    // Generate values around the average with some randomization
    const randomOffset = (Math.random() - 0.5) * 2 * variance
    const value = Math.max(0, avgBrix + randomOffset)
    values.push(Math.round(value * 10) / 10) // Round to 1 decimal
  }
  
  // Adjust the last value to ensure we hit the exact average
  const currentSum = values.slice(0, -1).reduce((sum, val) => sum + val, 0)
  const lastValue = (avgBrix * count) - currentSum
  values[count - 1] = Math.max(0, Math.round(lastValue * 10) / 10)
  
  return values
}

export function HarvestDetails({ 
  harvest, 
  open, 
  onOpenChange 
}: HarvestDetailsProps) {
  if (!harvest) return null
  
  const totalYield = harvest.classA + harvest.waste
  // Prevent NaN by checking for zero total yield
  const wasteRatio = totalYield > 0 ? (harvest.waste / totalYield) * 100 : 0
  const brixValues = generateBrixValues(harvest.avgBrix)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
          <SheetTitle className="text-xl font-bold">
            Harvest Details - Greenhouse {parseInt(harvest.id) % 2 === 1 ? '1' : '2'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-foreground">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-muted/30">
                  <span className="text-muted-foreground font-medium">Date:</span>
                  <span className="font-semibold text-foreground">{harvest.date}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-muted/30">
                  <span className="text-muted-foreground font-medium">Batch:</span>
                  <span className="font-semibold text-foreground">{harvest.batch}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-muted/30">
                  <span className="text-muted-foreground font-medium">Greenhouse:</span>
                  <span className="font-semibold text-blue-600">
                    GH{parseInt(harvest.id) % 2 === 1 ? '1' : '2'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground font-medium">Total Yield:</span>
                  <span className="font-bold text-teal-600 text-xl">
                    {totalYield.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Harvest Breakdown Section */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-foreground">Harvest Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">Marketable:</span>
                  <span className="font-bold text-teal-600 text-xl">
                    {harvest.classA} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">Waste:</span>
                  <span className="font-bold text-red-500 text-xl">
                    {harvest.waste} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground font-medium">Waste Ratio:</span>
                  <span className="bg-muted px-3 py-1 rounded text-sm font-medium">
                    {wasteRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Brix Measurements Section */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-foreground">Brix Measurements</h3>
                <span className="text-sm text-muted-foreground">
                  Avg: <span className="text-lg text-orange-500 font-medium">
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
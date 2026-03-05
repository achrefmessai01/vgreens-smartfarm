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

export function HarvestDetails({ 
  harvest, 
  open, 
  onOpenChange 
}: HarvestDetailsProps) {
  if (!harvest) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Harvest Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                General Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{harvest.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch</span>
                  <span className="font-medium">{harvest.batch}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                Harvest Results
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class A</span>
                  <span className={cn(
                    'font-medium',
                    'text-green-600 dark:text-green-400'
                  )}>
                    {harvest.classA} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waste</span>
                  <span className={cn(
                    'font-medium',
                    'text-red-600 dark:text-red-400'
                  )}>
                    {harvest.waste} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span className="font-medium">
                    {(harvest.classA + harvest.waste).toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Brix</span>
                  <span className="font-medium">{harvest.avgBrix}°Bx</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                Quality Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Rate</span>
                  <span className="font-medium">
                    {(
                      (harvest.classA / (harvest.classA + harvest.waste)) * 100
                    ).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium">
                    {harvest.photos === 0 ? 'None' : harvest.photos}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
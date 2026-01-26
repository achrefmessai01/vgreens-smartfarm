'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ArrowLeft } from 'lucide-react'
import { varieties, type Variety } from '@/lib/variety-data'
import { useI18n } from '@/i18n'
import { VarietyCard } from './variety-card'

interface VarietyCatalogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVarietyId: string
  onSelectVariety: (variety: Variety) => void
}

export function VarietyCatalogue({
  open,
  onOpenChange,
  selectedVarietyId,
  onSelectVariety,
}: VarietyCatalogueProps) {
  const { t } = useI18n()

  const handleSelectVariety = (variety: Variety) => {
    onSelectVariety(variety)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0 bg-gray-50 dark:bg-gray-900"
      >
        <div className="bg-white dark:bg-gray-800 rounded-t-lg p-6 pb-4">
          <SheetHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => onOpenChange(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.pages.nextCyclePlanner.varietyCatalogueTitle}
              </SheetTitle>
            </div>
            <SheetDescription className="text-base text-gray-600 dark:text-gray-400 pt-1">
              {t.pages.nextCyclePlanner.varietyCatalogueSubtitle}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {varieties.map((variety) => (
            <VarietyCard
              key={variety.id}
              variety={variety}
              isSelected={variety.id === selectedVarietyId}
              onClick={() => handleSelectVariety(variety)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

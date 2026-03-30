'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ArrowLeft } from 'lucide-react';
import { varieties, type Variety } from '@/lib/variety-data';
import { useI18n } from '@/i18n';
import { VarietyCard } from './variety-card';

interface VarietyCatalogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVarietyId: string;
  onSelectVariety: (variety: Variety) => void;
}

export function VarietyCatalogue({
  open,
  onOpenChange,
  selectedVarietyId,
  onSelectVariety,
}: VarietyCatalogueProps) {
  const { t } = useI18n();

  const handleSelectVariety = (variety: Variety) => {
    onSelectVariety(variety);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-gray-50 p-0 sm:max-w-md dark:bg-gray-900"
      >
        <div className="rounded-t-lg bg-white p-6 pb-4 dark:bg-gray-800">
          <SheetHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.pages.nextCyclePlanner.varietyCatalogueTitle}
              </SheetTitle>
            </div>
            <SheetDescription className="pt-1 text-base text-gray-600 dark:text-gray-400">
              {t.pages.nextCyclePlanner.varietyCatalogueSubtitle}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="space-y-4 px-6 pt-4 pb-6">
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
  );
}

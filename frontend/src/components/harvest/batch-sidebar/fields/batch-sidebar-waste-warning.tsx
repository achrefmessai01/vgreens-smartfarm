'use client';

import * as React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { wasteExceedsQualityTotal } from '@/lib/harvest-utils';

export interface WasteWarningProps {
  // Entered waste (kg) and the summed quality-class kg for this entry. Both are
  // already numbers (empty inputs collapse to 0), so the comparison can't NaN.
  waste: number;
  qualityTotalKg: number;
  // Whether the user has acknowledged the mismatch for this entry. Save is
  // gated upstream until either this is true or the inputs are corrected.
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

// Soft confirmation surfaced under the waste input when waste exceeds the
// summed quality yield. It never hard-blocks: the user either acknowledges the
// value (save proceeds) or corrects the inputs (the warning clears on its own,
// since the comparison re-evaluates on every change). Renders nothing while
// waste is within the quality total. Reused by both the weight and crate
// yield fields so the two modes warn identically.
export function WasteWarning({
  waste,
  qualityTotalKg,
  confirmed,
  onConfirmChange,
}: WasteWarningProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  if (!wasteExceedsQualityTotal(waste, qualityTotalKg)) return null;

  if (confirmed) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-300/60 bg-amber-50/60 px-3 py-2 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
        <span className="flex items-center gap-2 text-xs">
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          {h?.wasteConfirmedNote ?? 'Waste value confirmed.'}
        </span>
        <button
          type="button"
          onClick={() => onConfirmChange(false)}
          className="text-xs font-medium underline underline-offset-2 hover:no-underline"
        >
          {h?.undoWasteConfirmation ?? 'Undo'}
        </button>
      </div>
    );
  }

  const message = (
    h?.wasteExceedsQualityWarning ??
    'Waste ({waste} kg) is higher than the total quality yield ({quality} kg). Please confirm this entry is intentional before saving.'
  )
    .replace('{waste}', waste.toFixed(1))
    .replace('{quality}', qualityTotalKg.toFixed(1));

  return (
    <div
      role="alert"
      className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="text-xs">{message}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onConfirmChange(true)}
        className="h-7 border-amber-300 bg-transparent text-xs text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/20"
      >
        {h?.confirmWasteValue ?? 'Yes, waste is correct'}
      </Button>
    </div>
  );
}

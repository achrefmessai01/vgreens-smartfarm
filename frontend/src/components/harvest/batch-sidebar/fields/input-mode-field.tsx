'use client';

import { useI18n } from '@/i18n';
import { Label } from '@/components/ui/label';
import { InputMode } from '@/generated/graphql';

interface HarvestInputModeFieldProps {
  // The harvest's active mode.
  value: InputMode;
  // A staged (edit-mode) switch awaiting confirmation; highlights the target
  // mode while the parent renders the confirm step.
  pendingValue?: InputMode | null;
  onSelect: (mode: InputMode) => void;
  disabled?: boolean;
}

/**
 * Per-HARVEST yield input mode toggle (weight vs crate) — one batch can hold
 * harvests in different modes. While creating it simply flips the form layout;
 * while editing the parent stages a server-side conversion of the stored
 * entries and confirms it separately.
 */
export function HarvestInputModeField({
  value,
  pendingValue = null,
  onSelect,
  disabled = false,
}: HarvestInputModeFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const modes: ReadonlyArray<{ mode: InputMode; label: string }> = [
    { mode: InputMode.Weight, label: h?.weightMode ?? 'Weight (kg)' },
    { mode: InputMode.Crate, label: h?.crateMode ?? 'Crates' },
  ];
  const active = pendingValue ?? value;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {h?.inputMode ?? 'Yield input mode'}
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(mode)}
            className={`h-10 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active === mode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input bg-background text-muted-foreground hover:bg-muted/50'
            }`}
            aria-pressed={active === mode}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

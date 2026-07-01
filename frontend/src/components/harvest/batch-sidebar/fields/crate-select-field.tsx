'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Label } from '@/components/ui/label';
import { useCratesQuery } from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { FieldMessage } from '@/components/harvest/field-message';
import { AddCrateDialog } from './add-crate-dialog';

// Sentinel value used by the dropdown to open the "add crate" dialog instead of
// selecting an actual crate id (mirrors the variety dropdown's pattern).
const ADD_CRATE_SENTINEL = '__add_crate__';

interface CrateSelectFieldProps {
  // Selected crate id; '' / null when none is chosen yet.
  value: string | null;
  // Receives the chosen crate's id and weight (kg) so the parent can drive
  // crate-mode kg derivation off the selected crate.
  onSelect: (crateId: string, weight: number) => void;
  // Inline validation message (e.g. "Select a crate to continue").
  error?: string;
  disabled?: boolean;
}

/**
 * Crate selector for crate-mode harvests. Lists the current tenant's crates as
 * "<weight> kg" options and ends with a "+ Add new crate..." sentinel that opens
 * {@link AddCrateDialog}. Selection is required — the parent blocks save until a
 * crate is chosen.
 */
export function CrateSelectField({
  value,
  onSelect,
  error,
  disabled = false,
}: CrateSelectFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;
  // Scope the dropdown to the tenant in context so an admin only sees (and can
  // only pick) crates belonging to the tenant this harvest/batch is in.
  const tenantId = useTenantIdVariable();
  const { data, loading, refetch } = useCratesQuery({ variables: { tenantId } });
  const crates = data?.crates ?? [];
  const [addOpen, setAddOpen] = React.useState(false);

  const formatWeight = (weight: number) =>
    (h?.crateOptionLabel ?? '{weight} kg').replace('{weight}', String(weight));

  return (
    <div className="space-y-2">
      <Label htmlFor="harvestCrateId" className="text-sm font-medium">
        {h?.crate ?? 'Crate'} <span className="text-destructive">*</span>
      </Label>
      <select
        id="harvestCrateId"
        value={value ?? ''}
        onChange={(e) => {
          const selected = e.target.value;
          if (selected === ADD_CRATE_SENTINEL) {
            // Don't write the sentinel to form state; open the dialog instead.
            setAddOpen(true);
            return;
          }
          const crate = crates.find((c) => c.id === selected);
          if (crate) onSelect(crate.id, crate.weight);
        }}
        disabled={disabled || loading}
        aria-invalid={Boolean(error)}
        className={`border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-destructive' : ''
        }`}
      >
        <option value="" disabled>
          {h?.selectCrate ?? 'Select a crate...'}
        </option>
        {crates.map((crate) => (
          <option key={crate.id} value={crate.id}>
            {formatWeight(crate.weight)}
          </option>
        ))}
        <option value={ADD_CRATE_SENTINEL}>
          {h?.addCrateOption ?? '+ Add new crate...'}
        </option>
      </select>
      <FieldMessage>{error}</FieldMessage>
      <AddCrateDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={async (crate) => {
          // Make the new crate visible in the dropdown, then auto-select it so
          // the user can immediately continue logging the harvest.
          await refetch();
          onSelect(crate.id, crate.weight);
        }}
      />
    </div>
  );
}

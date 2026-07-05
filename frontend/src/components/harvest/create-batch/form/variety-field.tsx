'use client';

import * as React from 'react';
import { ChevronDown, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useI18n } from '@/i18n';
import { useVarietiesQuery, type VarietiesQuery } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { FieldMessage } from '@/components/harvest/field-message';
import { cn } from '@/lib/utils';
import { AddVarietyDialog } from './add-variety-dialog';
import {
  EditVarietyDialog,
  type EditableVariety,
} from './edit-variety-dialog';
import { DeleteVarietyDialog } from './delete-variety-dialog';

interface VarietyFieldProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

type VarietyRow = VarietiesQuery['varieties'][number];

// Variety selector with search + inline edit/delete. Options:
// - Reads varieties for the currently-selected crop (query is skipped until
//   a crop is picked so the panel stays empty rather than showing "no data").
// - Varieties are global (not tenant-scoped) — like crops, they're shared
//   reference data. Writes are still admin-gated on the server.
// - Filtering is case-insensitive, matches both name and description so a
//   user searching for a growing note (e.g. "cold-tolerant") still finds it.
// - Admin affordances (add/edit/delete) are gated on isTenantAdmin |
//   isVGreensAdmin. VGREENS_MEMBER is intentionally excluded — read-only.
export function VarietyField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: VarietyFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;
  const cropId = formData.cropId;
  const { isTenantAdmin, isVGreensAdmin } = useCurrentUser();
  const canManage = isTenantAdmin || isVGreensAdmin;

  const { data, loading, refetch } = useVarietiesQuery({
    variables: { cropId },
    skip: !cropId,
  });
  const varieties = React.useMemo<VarietyRow[]>(
    () => data?.varieties ?? [],
    [data?.varieties],
  );

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<EditableVariety | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<VarietyRow | null>(
    null,
  );
  const [mutationError, setMutationError] = React.useState<string | null>(null);

  // Clear search whenever the popover closes so the next open starts fresh.
  React.useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // If the selected crop changes, drop any variety selection that's now stale.
  React.useEffect(() => {
    if (formData.varietyId && varieties.length > 0) {
      const stillValid = varieties.some((v) => v.id === formData.varietyId);
      if (!stillValid) {
        setFormData((prev) => ({ ...prev, varietyId: '' }));
      }
    }
  }, [varieties, formData.varietyId, setFormData]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return varieties;
    return varieties.filter((v) => {
      const inName = v.name.toLowerCase().includes(q);
      const inDesc = (v.description ?? '').toLowerCase().includes(q);
      return inName || inDesc;
    });
  }, [varieties, search]);

  const selected = React.useMemo(
    () => varieties.find((v) => v.id === formData.varietyId) ?? null,
    [varieties, formData.varietyId],
  );

  const triggerLabel = (() => {
    if (!cropId) return h?.selectCropFirst ?? 'Select a crop first';
    if (loading && varieties.length === 0)
      return h?.loadingVarieties ?? 'Loading varieties...';
    if (selected) return selected.name;
    return h?.enterVariety ?? 'Select variety (optional)...';
  })();

  const triggerDisabled = disabled || !cropId || (loading && varieties.length === 0);

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, varietyId: '' }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="varietyId" className="text-sm font-medium">
        {h?.variety ?? 'Variety'}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id="varietyId"
            type="button"
            disabled={triggerDisabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              errors.varietyId ? 'border-destructive' : '',
              !selected && 'text-muted-foreground',
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <span className="flex items-center gap-1">
              {selected && !triggerDisabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={h?.clearVariety ?? 'Clear variety'}
                  onClick={clearSelection}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      clearSelection(e as unknown as React.MouseEvent);
                    }
                  }}
                  className="hover:text-foreground text-muted-foreground rounded p-0.5"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
              <ChevronDown
                className="text-muted-foreground h-4 w-4 shrink-0"
                aria-hidden
              />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[--radix-popover-trigger-width] min-w-[16rem] p-0"
        >
          <div className="border-b p-2">
            <div className="relative">
              <Search
                className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  h?.searchVarietyPlaceholder ?? 'Search varieties...'
                }
                className="h-9 pl-8"
                aria-label={h?.searchVariety ?? 'Search varieties'}
              />
            </div>
          </div>
          <div
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
            aria-label={h?.variety ?? 'Variety'}
          >
            {filtered.length === 0 && (
              <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                {search.trim()
                  ? (h?.noVarietiesMatch ?? 'No varieties match your search.')
                  : (h?.noVarietiesYet ?? 'No varieties yet.')}
              </div>
            )}
            {filtered.map((v) => {
              const isSelected = v.id === formData.varietyId;
              return (
                <div
                  key={v.id}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'group hover:bg-muted/50 flex items-center gap-2 px-2 py-1.5 text-sm',
                    isSelected && 'bg-muted/40',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, varietyId: v.id }));
                      setOpen(false);
                    }}
                    className="flex-1 truncate text-left"
                    title={v.description ?? undefined}
                  >
                    {v.name}
                  </button>
                  {canManage && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        aria-label={h?.editVariety ?? 'Edit variety'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTarget({
                            id: v.id,
                            name: v.name,
                            description: v.description ?? null,
                          });
                        }}
                        className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label={h?.deleteVariety ?? 'Delete variety'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(v);
                        }}
                        className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {canManage && cropId && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAddOpen(true);
              }}
              className="hover:bg-muted/60 flex w-full items-center gap-2 border-t px-3 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {h?.addVarietyOption ?? '+ Add new variety...'}
            </button>
          )}
        </PopoverContent>
      </Popover>
      <FieldMessage>{errors.varietyId}</FieldMessage>
      <FieldMessage variant="warning">{mutationError}</FieldMessage>
      {cropId && (
        <AddVarietyDialog
          open={addOpen}
          cropId={cropId}
          onOpenChange={setAddOpen}
          onCreated={async (variety) => {
            await refetch();
            setFormData((prev) => ({ ...prev, varietyId: variety.id }));
          }}
        />
      )}
      <EditVarietyDialog
        open={editTarget !== null}
        variety={editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        onUpdated={async () => {
          setEditTarget(null);
          await refetch();
        }}
      />
      <DeleteVarietyDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        varietyId={deleteTarget?.id ?? null}
        varietyName={deleteTarget?.name ?? ''}
        onDeleted={async (deletedId) => {
          setDeleteTarget(null);
          setMutationError(null);
          // Clear selection if the deleted row was the current pick — the
          // dropdown will just remove it after refetch either way, but the
          // form state should not point at a soft-deleted id.
          if (formData.varietyId === deletedId) {
            setFormData((prev) => ({ ...prev, varietyId: '' }));
          }
          await refetch();
        }}
        onError={(msg) => setMutationError(msg)}
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { Building, ChevronRight, Plus } from 'lucide-react';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { GreenhouseRow } from './greenhouse-row';
import { GreenhouseCropsSection } from './greenhouse-crops-section';
import { GreenhouseCyclesSection } from './greenhouse-cycles-section';
import { useFarmLayoutConfig } from './use-farm-layout-config';

interface FarmLayoutConfigProps {
  tenantId: string;
}

export function FarmLayoutConfig({ tenantId }: FarmLayoutConfigProps) {
  const { t } = useI18n();
  const fl = t.pages.admin.tenants.farmLayout;
  const {
    rows,
    saving,
    rowErrors,
    saveError,
    addRow,
    updateRow,
    removeRow,
    handleSubmit,
  } = useFarmLayoutConfig(tenantId);

  const [open, setOpen] = React.useState(true);
  // Per-row expansion, keyed by the row's stable key. Saved greenhouses start
  // collapsed; freshly added rows start expanded so they can be filled in.
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});
  const isRowExpanded = (key: string, isNew: boolean) =>
    expandedRows[key] ?? isNew;
  const toggleRow = (key: string, isNew: boolean) =>
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !isRowExpanded(key, isNew),
    }));

  const handleSave = async () => {
    const errors = await handleSubmit();
    // Surface validation failures: open the card and the offending rows.
    if (errors) {
      setOpen(true);
      setExpandedRows((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(errors)) next[key] = true;
        return next;
      });
    }
  };

  const handleAddRow = () => {
    setOpen(true);
    addRow();
  };

  return (
    <div className="bg-card border-border/60 rounded-xl border shadow-sm">
      <div className="border-border/40 flex items-center justify-between gap-3 border-b py-3 pr-6 pl-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-3 py-1 text-left"
        >
          <ChevronRight
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              open && 'rotate-90',
            )}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{fl.title}</h3>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {fl.subtitle}
            </p>
          </div>
        </button>
        <WriteActionButton
          type="button"
          size="sm"
          disabled={saving}
          className="min-w-16 shrink-0"
          onClick={() => void handleSave()}
        >
          {saving ? fl.saving : fl.save}
        </WriteActionButton>
      </div>

      {open && (
        <div className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Building className="h-4 w-4" />
              {fl.greenhouses}
            </div>
            <WriteActionButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              disabled={saving}
            >
              <Plus className="mr-1 h-4 w-4" />
              {fl.add}
            </WriteActionButton>
          </div>

          {saveError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
              {saveError === 'validation' ? fl.validationError : fl.saveFailed}
            </div>
          )}

          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">{fl.noGreenhouses}</p>
          ) : (
            rows.map((row, index) => (
              <GreenhouseRow
                key={row.key}
                row={row}
                index={index}
                disabled={saving}
                expanded={isRowExpanded(row.key, !row.id)}
                onToggle={() => toggleRow(row.key, !row.id)}
                errors={rowErrors[row.key]}
                errorMessages={{
                  name: fl.nameRequired,
                  dimensions: fl.dimensionsInvalid,
                  bayCount: fl.bayCountInvalid,
                }}
                greenhouseLabel={fl.greenhouseLabel}
                nameLabel={fl.nameLabel}
                xLabel={fl.xLabel}
                yLabel={fl.yLabel}
                doorLabel={fl.doorLabel}
                bayCountLabel={fl.bayCountLabel}
                orientationLabel={fl.orientationLabel}
                visibilityLabel={fl.visibilityLabel}
                visibilityHint={fl.visibilityHint}
                namePlaceholder={fl.namePlaceholder}
                xPlaceholder={fl.xDimensionPlaceholder}
                yPlaceholder={fl.yDimensionPlaceholder}
                doorPositionPlaceholder={fl.doorPositionPlaceholder}
                bayCountPlaceholder={fl.bayCountPlaceholder}
                onChange={updateRow}
                onRemove={removeRow}
              >
                {row.id ? (
                  <>
                    <GreenhouseCropsSection greenhouseId={row.id} />
                    <GreenhouseCyclesSection
                      tenantId={tenantId}
                      greenhouseId={row.id}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground border-border/40 border-t px-4 py-3 text-xs">
                    Save the greenhouse to assign crops and irrigation cycles.
                  </p>
                )}
              </GreenhouseRow>
            ))
          )}
        </div>
      )}
    </div>
  );
}

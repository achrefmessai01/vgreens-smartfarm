'use client';

import { Building, Plus } from 'lucide-react';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { useI18n } from '@/i18n';
import { GreenhouseRow } from './greenhouse-row';
import { useFarmLayoutConfig } from './use-farm-layout-config';

interface FarmLayoutConfigProps {
  tenantId: string;
}

export function FarmLayoutConfig({ tenantId }: FarmLayoutConfigProps) {
  const { t } = useI18n();
  const fl = t.pages.admin.tenants.farmLayout;
  const { rows, saving, addRow, updateRow, removeRow, handleSubmit } =
    useFarmLayoutConfig(tenantId);

  return (
    <div className="bg-card border-border/60 rounded-xl border shadow-sm">
      <div className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold">{fl.title}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">{fl.subtitle}</p>
        </div>
        <WriteActionButton
          type="submit"
          size="sm"
          disabled={saving}
          className="min-w-16"
          form="farm-layout-form"
        >
          {saving ? fl.saving : fl.save}
        </WriteActionButton>
      </div>

      <form
        id="farm-layout-form"
        onSubmit={handleSubmit}
        className="space-y-3 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Building className="h-4 w-4" />
            {fl.greenhouses}
          </div>
          <WriteActionButton
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={saving}
          >
            <Plus className="mr-1 h-4 w-4" />
            {fl.add}
          </WriteActionButton>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">{fl.noGreenhouses}</p>
        ) : (
          rows.map((row, index) => (
            <GreenhouseRow
              key={`gh-${index}`}
              row={row}
              index={index}
              disabled={saving}
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
            />
          ))
        )}
      </form>
    </div>
  );
}

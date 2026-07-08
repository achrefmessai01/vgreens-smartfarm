'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { SensorConfigFormFields } from './sensor-config-form-fields';
import { SensorConfigFormFooter } from './sensor-config-form-footer';
import type { SensorRow } from './use-sensor-config';
import {
  useSensorConfigForm,
  type SensorConfigSubmitInput,
} from './use-sensor-config-form';

interface SensorConfigFormProps {
  row: SensorRow;
  tenantId: string;
  onSave: (input: SensorConfigSubmitInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  saving: boolean;
  onClose: () => void;
}

/**
 * Sidebar form for editing a sensor's position + greenhouse override and its
 * farm-overview visibility. This shell is intentionally thin: greenhouse
 * fetching, form state, and bounds validation live in
 * `useSensorConfigForm`; field rendering lives in
 * `SensorConfigFormFields`; the button row lives in
 * `SensorConfigFormFooter`. Keeping this file at composition-only lets it
 * fit comfortably under the repo-wide 150-line component limit.
 */
export function SensorConfigForm({
  row,
  tenantId,
  onSave,
  onDelete,
  saving,
  onClose,
}: SensorConfigFormProps) {
  const { t } = useI18n();
  const sc = t.pages.admin.tenants.sensorConfig;
  const {
    values,
    setValues,
    greenhouseOptions,
    greenhouseLoading,
    bounds,
    xMaxHint,
    yMaxHint,
    handleSubmit,
  } = useSensorConfigForm(row, tenantId, t, onSave, onClose);

  const hasConfig = !!row.config;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-1 pt-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            hasConfig
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {hasConfig ? sc.customConfig : sc.influxDefaults}
        </span>
      </div>

      <Separator />

      <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
        <div className="flex flex-col gap-0.5">
          <Label
            htmlFor="field-visible"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Eye className="text-muted-foreground h-3.5 w-3.5" />
            {sc.showInFarmOverview}
          </Label>
          <p className="text-muted-foreground text-xs">
            {sc.showInFarmOverviewHint}
          </p>
        </div>
        <Switch
          id="field-visible"
          checked={values.visible}
          onCheckedChange={(checked) =>
            setValues((prev) => ({ ...prev, visible: checked }))
          }
        />
      </div>

      <Separator />

      <SensorConfigFormFields
        values={values}
        setValues={setValues}
        bounds={bounds}
        defaultPosition={row.defaultPosition}
        greenhouseOptions={greenhouseOptions}
        greenhouseLoading={greenhouseLoading}
        xMaxHint={xMaxHint}
        yMaxHint={yMaxHint}
      />

      <Separator />

      <SensorConfigFormFooter
        hasConfig={hasConfig}
        configId={row.config?.id}
        saving={saving}
        disableSave={saving || bounds.hasError}
        onDelete={onDelete}
        onCancel={onClose}
        onClose={onClose}
      />
    </form>
  );
}

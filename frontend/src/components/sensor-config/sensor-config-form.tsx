'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTenantGreenhousesQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  SENSOR_CONFIG_FIELD_KEYS,
  type SensorConfigFieldKey,
} from '@/lib/sensor-config-constants';
import { cn } from '@/lib/utils';
import { Building2, Eye, Layers, Navigation, Trash2 } from 'lucide-react';
import * as React from 'react';
import type { SensorRow } from './use-sensor-config';
import type { DefaultPosition } from '@/lib/sensor-default-positions';

interface SensorConfigFormProps {
  row: SensorRow;
  tenantId: string;
  onSave: (input: {
    device: string;
    xPosition?: number;
    yPosition?: number;
    greenhouse?: string;
    hiddenInFarmOverview?: boolean;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  saving: boolean;
  onClose: () => void;
}

const FIELD_ICONS: Record<SensorConfigFieldKey, React.ElementType> = {
  xPosition: Layers,
  yPosition: Navigation,
  greenhouse: Building2,
};

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

  // Greenhouse identifiers from the tenant's configured greenhouses (not
  // InfluxDB tags). This ensures the dropdown only shows greenhouses that
  // have proper layout configuration (xDimension, yDimension, bayCount).
  // Also include the current override value so legacy entries always have
  // a matching option.
  const { data: greenhouseData, loading: greenhouseLoading } =
    useTenantGreenhousesQuery({
      variables: { tenantId },
      skip: !tenantId,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'network-only',
    });
  const configuredGreenhouses = React.useMemo(
    () => greenhouseData?.tenantGreenhouses ?? [],
    [greenhouseData?.tenantGreenhouses],
  );
  const greenhouseOptions = React.useMemo(() => {
    // Only use the configured greenhouses from the database
    // Don't include legacy InfluxDB values from old overrides
    return [...configuredGreenhouses].sort();
  }, [configuredGreenhouses]);
  const hasNoConfiguredGreenhouses = configuredGreenhouses.length === 0;

  const hintKey: Record<SensorConfigFieldKey, string> = {
    xPosition: sc.xPositionHint,
    yPosition: sc.yPositionHint,
    greenhouse: sc.greenhouseHint,
  };

  // When the sensor has no override, fall back to the dynamically computed
  // default position as the input placeholder. The user can leave the input
  // blank to keep tracking the dynamic default, or type a value to lock in
  // a specific position.
  const def: DefaultPosition | null = row.defaultPosition;
  const placeholderKey: Record<SensorConfigFieldKey, string> = {
    xPosition: def ? `Default: ${def.xPosition}` : sc.xPositionPlaceholder,
    yPosition: def ? `Default: ${def.yPosition}` : sc.yPositionPlaceholder,
    greenhouse: sc.greenhousePlaceholder,
  };

  const labelKey: Record<SensorConfigFieldKey, string> = {
    xPosition: sc.xPosition,
    yPosition: sc.yPosition,
    greenhouse: sc.greenhouse,
  };

  // Pre-select the configured greenhouse override if it exists.
  //
  // Treat (0, 0) overrides as "no real position set" — those are typically
  // legacy seed values, not deliberate placements at the origin. Leaving the
  // inputs blank lets the user keep the dynamic default by simply hitting Save
  // without typing.
  const isLegacyZero =
    row.config?.xPosition === 0 && row.config?.yPosition === 0;
  const [values, setValues] = React.useState({
    xPosition:
      isLegacyZero || row.config?.xPosition == null
        ? ''
        : row.config.xPosition.toString(),
    yPosition:
      isLegacyZero || row.config?.yPosition == null
        ? ''
        : row.config.yPosition.toString(),
    greenhouse: row.config?.greenhouse ?? '',
    visible: !(row.config?.hiddenInFarmOverview ?? false),
  });

  const set =
    (key: SensorConfigFieldKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      device: row.device,
      xPosition:
        values.xPosition.trim() === '' ? undefined : Number(values.xPosition),
      yPosition:
        values.yPosition.trim() === '' ? undefined : Number(values.yPosition),
      greenhouse: (values.greenhouse as string) || undefined,
      hiddenInFarmOverview: !values.visible,
    });
    onClose();
  };

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

      <div className="flex flex-col gap-4">
        {SENSOR_CONFIG_FIELD_KEYS.map((key) => {
          const Icon = FIELD_ICONS[key];
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <Label
                htmlFor={`field-${key}`}
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <Icon className="text-muted-foreground h-3.5 w-3.5" />
                {labelKey[key]}
              </Label>

              {key === 'greenhouse' ? (
                <Select
                  value={values.greenhouse as string}
                  onValueChange={(val) =>
                    setValues((prev) => ({ ...prev, greenhouse: val }))
                  }
                  disabled={greenhouseLoading}
                >
                  <SelectTrigger id="field-greenhouse" className="h-9 w-full">
                    <SelectValue placeholder="Select a greenhouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {greenhouseOptions.length === 0 ? (
                      <div className="text-muted-foreground px-2 py-1.5 text-xs">
                        {hasNoConfiguredGreenhouses
                          ? 'No greenhouses configured for this tenant.'
                          : '—'}
                      </div>
                    ) : (
                      greenhouseOptions.map((gh) => (
                        <SelectItem key={gh} value={gh}>
                          {gh}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`field-${key}`}
                  type={
                    key === 'xPosition' || key === 'yPosition'
                      ? 'number'
                      : 'text'
                  }
                  step={
                    key === 'xPosition' || key === 'yPosition'
                      ? '0.01'
                      : undefined
                  }
                  min={
                    key === 'xPosition' || key === 'yPosition' ? '0' : undefined
                  }
                  value={values[key]}
                  onChange={set(key)}
                  placeholder={placeholderKey[key]}
                  className="h-9"
                />
              )}

              <p className="text-muted-foreground text-xs">{hintKey[key]}</p>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        {hasConfig ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={async () => {
              await onDelete(row.config!.id);
              onClose();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {sc.resetToDefaults}
          </Button>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            {sc.cancel}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="min-w-16"
          >
            {saving ? sc.saving : sc.save}
          </Button>
        </div>
      </div>
    </form>
  );
}

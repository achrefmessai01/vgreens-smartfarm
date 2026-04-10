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
import { useGreenhouseOptionsQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  SENSOR_CONFIG_FIELD_KEYS,
  type SensorConfigFieldKey,
} from '@/lib/sensor-config-constants';
import { cn } from '@/lib/utils';
import { Building2, Layers, Navigation, Trash2 } from 'lucide-react';
import * as React from 'react';
import type { SensorRow } from './use-sensor-config';

interface SensorConfigFormProps {
  row: SensorRow;
  tenantId: string;
  onSave: (input: {
    device: string;
    xPosition?: number;
    yPosition?: number;
    greenhouse?: string;
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

  const { data: greenhouseData, loading: greenhouseLoading } =
    useGreenhouseOptionsQuery({
      variables: { tenantId },
      skip: !tenantId,
    });
  const greenhouseOptions = greenhouseData?.greenhouseOptions ?? [];

  const hintKey: Record<SensorConfigFieldKey, string> = {
    xPosition: sc.xPositionHint,
    yPosition: sc.yPositionHint,
    greenhouse: sc.greenhouseHint,
  };

  const placeholderKey: Record<SensorConfigFieldKey, string> = {
    xPosition: sc.xPositionPlaceholder,
    yPosition: sc.yPositionPlaceholder,
    greenhouse: sc.greenhousePlaceholder,
  };

  const labelKey: Record<SensorConfigFieldKey, string> = {
    xPosition: sc.xPosition,
    yPosition: sc.yPosition,
    greenhouse: sc.greenhouse,
  };

  const [values, setValues] = React.useState({
    xPosition: row.config?.xPosition?.toString() ?? '',
    yPosition: row.config?.yPosition?.toString() ?? '',
    greenhouse: row.config?.greenhouse ?? '',
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
                  <SelectTrigger id="field-greenhouse" className="h-9">
                    <SelectValue placeholder={placeholderKey.greenhouse} />
                  </SelectTrigger>
                  <SelectContent>
                    {greenhouseOptions.map((gh) => (
                      <SelectItem key={gh} value={gh}>
                        {gh}
                      </SelectItem>
                    ))}
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

'use client';

import * as React from 'react';
import {
  MapPin,
  Navigation,
  Layers,
  Building2,
  Globe,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { useGreenhouseOptionsQuery } from '@/generated/graphql';
import {
  SENSOR_CONFIG_FIELD_KEYS,
  type SensorConfigFieldKey,
} from '@/lib/sensor-config-constants';
import type { SensorRow } from './use-sensor-config';

interface SensorConfigFormProps {
  row: SensorRow;
  tenantId: string;
  onSave: (input: {
    device: string;
    bay?: string;
    pole?: string;
    row?: string;
    greenhouse?: string;
    city?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  saving: boolean;
  onClose: () => void;
}

const FIELD_ICONS: Record<SensorConfigFieldKey, React.ElementType> = {
  bay: Layers,
  pole: Navigation,
  row: MapPin,
  greenhouse: Building2,
  city: Globe,
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
    bay: sc.bayHint,
    pole: sc.poleHint,
    row: sc.rowHint,
    greenhouse: sc.greenhouseHint,
    city: sc.cityHint,
  };

  const placeholderKey: Record<SensorConfigFieldKey, string> = {
    bay: sc.bayPlaceholder,
    pole: sc.polePlaceholder,
    row: sc.rowPlaceholder,
    greenhouse: sc.greenhousePlaceholder,
    city: sc.cityPlaceholder,
  };

  const labelKey: Record<SensorConfigFieldKey, string> = {
    bay: sc.bay,
    pole: sc.pole,
    row: sc.row,
    greenhouse: sc.greenhouse,
    city: sc.city,
  };

  const [values, setValues] = React.useState<
    Record<SensorConfigFieldKey, string>
  >({
    bay: row.config?.bay ?? '',
    pole: row.config?.pole ?? '',
    row: row.config?.row ?? '',
    greenhouse: row.config?.greenhouse ?? '',
    city: row.config?.city ?? '',
  });

  const set =
    (key: SensorConfigFieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      device: row.device,
      bay: values.bay || undefined,
      pole: values.pole || undefined,
      row: values.row || undefined,
      greenhouse: values.greenhouse || undefined,
      city: values.city || undefined,
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
                  value={values.greenhouse}
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

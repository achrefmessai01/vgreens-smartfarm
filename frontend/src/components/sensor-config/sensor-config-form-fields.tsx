'use client';

import { useI18n } from '@/i18n';
import { Layers, Navigation } from 'lucide-react';
import * as React from 'react';
import type { DefaultPosition } from '@/lib/sensor-default-positions';
import type { PositionBoundsResult } from './use-position-bounds';
import { SensorConfigGreenhouseField } from './sensor-config-greenhouse-field';
import { SensorConfigPositionField } from './sensor-config-position-field';
import type { SensorConfigFormValues } from './use-sensor-config-form';

interface GreenhouseOption {
  id: string;
  name: string;
  xDimension?: number | null;
  yDimension?: number | null;
}

interface SensorConfigFormFieldsProps {
  values: SensorConfigFormValues;
  setValues: React.Dispatch<React.SetStateAction<SensorConfigFormValues>>;
  bounds: PositionBoundsResult;
  defaultPosition: DefaultPosition | null;
  greenhouseOptions: readonly GreenhouseOption[];
  greenhouseLoading: boolean;
  xMaxHint: number | undefined;
  yMaxHint: number | undefined;
}

/**
 * Orchestrates the three sensor-config field rows. Row primitives live in
 * their own files (`sensor-config-position-field`,
 * `sensor-config-greenhouse-field`) so each file stays under the repo-wide
 * 150-line component limit.
 */
export function SensorConfigFormFields({
  values,
  setValues,
  bounds,
  defaultPosition,
  greenhouseOptions,
  greenhouseLoading,
  xMaxHint,
  yMaxHint,
}: SensorConfigFormFieldsProps) {
  const { t } = useI18n();
  const sc = t.pages.admin.tenants.sensorConfig;

  const setAxis =
    (key: 'xPosition' | 'yPosition') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const placeholderFor = (axis: 'x' | 'y') => {
    const fallback =
      axis === 'x' ? sc.xPositionPlaceholder : sc.yPositionPlaceholder;
    if (!defaultPosition) return fallback;
    const value =
      axis === 'x' ? defaultPosition.xPosition : defaultPosition.yPosition;
    return sc.defaultPrefix.replace('{value}', String(value));
  };

  return (
    <div className="flex flex-col gap-4">
      <SensorConfigPositionField
        id="xPosition"
        label={sc.xPosition}
        hint={sc.xPositionHint}
        placeholder={placeholderFor('x')}
        value={values.xPosition}
        onChange={setAxis('xPosition')}
        error={bounds.xError}
        max={xMaxHint}
        Icon={Layers}
      />
      <SensorConfigPositionField
        id="yPosition"
        label={sc.yPosition}
        hint={sc.yPositionHint}
        placeholder={placeholderFor('y')}
        value={values.yPosition}
        onChange={setAxis('yPosition')}
        error={bounds.yError}
        max={yMaxHint}
        Icon={Navigation}
      />
      <SensorConfigGreenhouseField
        label={sc.greenhouse}
        hint={sc.greenhouseHint}
        placeholder={sc.selectGreenhouse}
        value={values.greenhouse}
        onChange={(v) => setValues((prev) => ({ ...prev, greenhouse: v }))}
        options={greenhouseOptions}
        loading={greenhouseLoading}
        emptyMessage={sc.noGreenhousesConfigured}
      />
    </div>
  );
}

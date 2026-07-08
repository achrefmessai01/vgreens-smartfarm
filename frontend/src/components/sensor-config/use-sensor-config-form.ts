'use client';

import * as React from 'react';
import { useGreenhousesQuery } from '@/generated/graphql';
import type { Translations } from '@/i18n/translations';
import { validatePositionBounds } from './use-position-bounds';
import type { SensorRow } from './use-sensor-config';

/**
 * Local form state for the sensor-config sidebar. Position values are kept
 * as strings so the "blank means keep the dynamic default" behavior survives
 * a controlled input — we only coerce to a number on submit.
 */
export interface SensorConfigFormValues {
  xPosition: string;
  yPosition: string;
  greenhouse: string;
  visible: boolean;
}

export interface SensorConfigSubmitInput {
  device: string;
  xPosition?: number;
  yPosition?: number;
  greenhouseId?: string;
  hiddenInFarmOverview?: boolean;
}

/**
 * All non-presentational logic for `SensorConfigForm`: the greenhouse
 * dropdown data, controlled form state (with legacy-zero and null-safe
 * seeding), live bounds validation against the *selected* greenhouse, and
 * the submit handler that closes the sidebar on success. Extracted out of
 * the component so the form file stays under the repo-wide 150-line hard
 * limit and stays purely presentational.
 */
export function useSensorConfigForm(
  row: SensorRow,
  tenantId: string,
  t: Translations,
  onSave: (input: SensorConfigSubmitInput) => Promise<void>,
  onClose: () => void,
) {
  // Options come from the dedicated greenhouses table so the dropdown only
  // exposes greenhouses that carry proper layout config (xDimension,
  // yDimension, bayCount). Network-only fetch keeps stale bounds from
  // silently accepting invalid positions.
  const { data, loading } = useGreenhousesQuery({
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  });

  const greenhouseOptions = React.useMemo(
    () =>
      [...(data?.greenhouses ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [data?.greenhouses],
  );

  // Treat (0, 0) overrides as "no real position set" — they're usually
  // legacy seed values, not deliberate origin placements. Blanking the
  // inputs lets the user keep the dynamic default by hitting Save without
  // typing anything.
  const isLegacyZero =
    row.config?.xPosition === 0 && row.config?.yPosition === 0;

  const [values, setValues] = React.useState<SensorConfigFormValues>({
    xPosition:
      isLegacyZero || row.config?.xPosition == null
        ? ''
        : row.config.xPosition.toString(),
    yPosition:
      isLegacyZero || row.config?.yPosition == null
        ? ''
        : row.config.yPosition.toString(),
    greenhouse: row.config?.greenhouseId ?? '',
    visible: !(row.config?.hiddenInFarmOverview ?? false),
  });

  // Live bounds check against the *currently selected* greenhouse. Recomputes
  // on every keystroke / dropdown change so the warning appears immediately
  // when the sensor is pushed past the greenhouse footprint and disappears
  // as soon as the user corrects it or picks a bigger greenhouse.
  const bounds = validatePositionBounds(
    values.xPosition,
    values.yPosition,
    values.greenhouse,
    greenhouseOptions,
    t,
  );

  const selectedGreenhouse = greenhouseOptions.find(
    (gh) => gh.id === values.greenhouse,
  );
  const xMaxHint = selectedGreenhouse?.xDimension ?? undefined;
  const yMaxHint = selectedGreenhouse?.yDimension ?? undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Defensive guard — the Save button is already disabled while out of
    // bounds, but keyboard submits still need to be refused rather than
    // pushing a nonsensical position to the backend.
    if (bounds.hasError) return;
    await onSave({
      device: row.device,
      xPosition:
        values.xPosition.trim() === '' ? undefined : Number(values.xPosition),
      yPosition:
        values.yPosition.trim() === '' ? undefined : Number(values.yPosition),
      greenhouseId: values.greenhouse || undefined,
      hiddenInFarmOverview: !values.visible,
    });
    onClose();
  };

  return {
    values,
    setValues,
    greenhouseOptions,
    greenhouseLoading: loading,
    bounds,
    xMaxHint,
    yMaxHint,
    handleSubmit,
  };
}

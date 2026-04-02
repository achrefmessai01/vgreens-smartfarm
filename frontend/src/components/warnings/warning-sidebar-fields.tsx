'use client';

import type {
  SensorNameFieldProps,
  ValueFieldProps,
  TimeStampFieldProps,
  TunnelFieldProps,
  StatusFieldProps,
} from './warning-sidebar-types';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function SensorNameField({
  isLoading,
  sensorName,
}: SensorNameFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="sensorName">
        {t.pages.warnings.sensorName}
      </FieldLabel>
      <FieldContent>
        <Input id="sensorName" type="text" value={sensorName} disabled={true} />
      </FieldContent>
    </Field>
  );
}

export function ValueField({ isLoading, value }: ValueFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="value">{t.pages.warnings.value}</FieldLabel>
      <FieldContent>
        <Input id="value" type="text" value={value} disabled={true} />
      </FieldContent>
    </Field>
  );
}

export function TimeStampField({ isLoading, timestamp }: TimeStampFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="timestamp">{t.pages.warnings.timestamp}</FieldLabel>
      <FieldContent>
        <Input id="timestamp" type="text" value={timestamp} disabled={true} />
      </FieldContent>
    </Field>
  );
}

export function TunnelField({ isLoading, tunnel }: TunnelFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="tunnel">{t.pages.warnings.tunnel}</FieldLabel>
      <FieldContent>
        <Input id="tunnel" type="text" value={tunnel} disabled={true} />
      </FieldContent>
    </Field>
  );
}

export function StatusField({ isLoading, status }: StatusFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="status">{t.pages.warnings.status}</FieldLabel>
      <FieldContent>
        <Input id="status" type="text" value={status} disabled={true} />
      </FieldContent>
    </Field>
  );
}

'use client'

import type {
  SensorNameFieldProps,
  ValueFieldProps,
  StatusFieldProps,
  SeverityFieldProps,
  TimeStampFieldProps,
  DescriptionFieldProps,
  AcknowledgedByFieldProps,
  ResolvedByFieldProps,
} from './alert-sidebar-types'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function SensorNameField({
  sensorName,
}: SensorNameFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-sensor-name">{t.pages.alerts.sensorName}</FieldLabel>
      <FieldContent>
        <Input id="alert-sensor-name" type="text" value={sensorName} disabled />
      </FieldContent>
    </Field>
  )
}

export function ValueField({ value }: ValueFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-value">{t.pages.alerts.value}</FieldLabel>
      <FieldContent>
        <Input id="alert-value" type="text" value={value} disabled />
      </FieldContent>
    </Field>
  )
}

export function StatusField({ status }: StatusFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-status">{t.pages.alerts.status}</FieldLabel>
      <FieldContent>
        <Input id="alert-status" type="text" value={status} disabled />
      </FieldContent>
    </Field>
  )
}

export function SeverityField({ severity }: SeverityFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-severity">{t.pages.alerts.severity}</FieldLabel>
      <FieldContent>
        <Input id="alert-severity" type="text" value={severity} disabled />
      </FieldContent>
    </Field>
  )
}

export function TimeStampField({ timestamp }: TimeStampFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-timestamp">{t.pages.alerts.timestamp}</FieldLabel>
      <FieldContent>
        <Input id="alert-timestamp" type="text" value={timestamp} disabled />
      </FieldContent>
    </Field>
  )
}

export function DescriptionField({
  description,
}: DescriptionFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-description">{t.pages.alerts.description}</FieldLabel>
      <FieldContent>
        <Textarea id="alert-description" value={description} rows={3} disabled />
      </FieldContent>
    </Field>
  )
}

export function AcknowledgedByField({
  acknowledgedBy,
}: AcknowledgedByFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-acknowledged-by">{t.pages.alerts.acknowledgedBy}</FieldLabel>
      <FieldContent>
        <Input
          id="alert-acknowledged-by"
          type="text"
          value={acknowledgedBy}
          disabled
        />
      </FieldContent>
    </Field>
  )
}

export function ResolvedByField({
  resolvedBy,
}: ResolvedByFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-resolved-by">{t.pages.alerts.resolvedBy}</FieldLabel>
      <FieldContent>
        <Input id="alert-resolved-by" type="text" value={resolvedBy} disabled />
      </FieldContent>
    </Field>
  )
}

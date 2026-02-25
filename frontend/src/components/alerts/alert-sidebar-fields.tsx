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
  FieldFieldProps,
  LocationFieldProps,
  AcknowledgedAtFieldProps,
  ResolvedAtFieldProps,
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
        <Input id="alert-sensor-name" type="text" value={sensorName} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
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
        <Input id="alert-value" type="text" value={value} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
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
        <Input id="alert-status" type="text" value={status} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
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
        <Input id="alert-severity" type="text" value={severity} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
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
        <Input id="alert-timestamp" type="text" value={timestamp} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
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
        <Textarea id="alert-description" value={description} rows={3} disabled className="bg-muted/30 resize-none disabled:opacity-100 disabled:text-foreground/90" />
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
          className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90"
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
        <Input id="alert-resolved-by" type="text" value={resolvedBy} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
      </FieldContent>
    </Field>
  )
}

export function FieldField({ field }: FieldFieldProps) {
  const { t } = useI18n()
  const labels: Record<string, string> = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    vpd: 'VPD',
    soil_moisture: 'Soil moisture',
    soil_ec: 'Soil EC',
    soil_temp: 'Soil temp',
    par: 'PAR',
    co2: 'CO2',
  }
  const display = field ? (labels[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())) : '-'
  return (
    <Field>
      <FieldLabel htmlFor="alert-field">{t.pages.alerts.field}</FieldLabel>
      <FieldContent>
        <Input id="alert-field" type="text" value={display} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
      </FieldContent>
    </Field>
  )
}

export function LocationFields({
  greenhouse,
  device,
  city,
  column,
  row,
  measurement,
  profile,
}: LocationFieldProps) {
  const { t } = useI18n()
  const items = [
    { label: t.pages.alerts.greenhouse, value: greenhouse },
    { label: t.pages.alerts.device, value: device },
    { label: t.pages.alerts.city, value: city },
    { label: t.pages.alerts.column, value: column },
    { label: t.pages.alerts.row, value: row },
    { label: t.pages.alerts.measurement, value: measurement },
    { label: t.pages.alerts.profile, value: profile },
  ].filter((i) => i.value)
  if (items.length === 0) return null
  return (
    <Field>
      <FieldLabel className="text-muted-foreground font-medium">
        {t.pages.alerts.location}
      </FieldLabel>
      <FieldContent>
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
          {items.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-medium truncate">{value}</span>
            </div>
          ))}
        </div>
      </FieldContent>
    </Field>
  )
}

export function AcknowledgedAtField({ acknowledgedAt }: AcknowledgedAtFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-ack-at">{t.pages.alerts.acknowledgedAt}</FieldLabel>
      <FieldContent>
        <Input id="alert-ack-at" type="text" value={acknowledgedAt} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
      </FieldContent>
    </Field>
  )
}

export function ResolvedAtField({ resolvedAt }: ResolvedAtFieldProps) {
  const { t } = useI18n()
  return (
    <Field>
      <FieldLabel htmlFor="alert-resolved-at">{t.pages.alerts.resolvedAt}</FieldLabel>
      <FieldContent>
        <Input id="alert-resolved-at" type="text" value={resolvedAt} disabled className="bg-muted/30 disabled:opacity-100 disabled:text-foreground/90" />
      </FieldContent>
    </Field>
  )
}

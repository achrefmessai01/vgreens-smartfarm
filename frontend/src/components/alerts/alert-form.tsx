'use client'

import * as React from 'react'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import type { Alert } from '@/generated/graphql'
import { Textarea } from '@/components/ui/textarea'

interface AlertFormData {
  sensorName: string
  value: string
  description?: string
}

export interface AlertFormRef {
  submit: () => void
}

interface AlertFormProps {
  initialData?: Partial<Alert>
  onSubmit: (data: AlertFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export const AlertForm = React.forwardRef<AlertFormRef, AlertFormProps>(
  ({ initialData, onSubmit, onCancel, isLoading = false }, ref) => {
    const { t } = useI18n()
    const formRef = React.useRef<HTMLFormElement>(null)
    const [formData, setFormData] = React.useState<AlertFormData>({
      sensorName: initialData?.sensorName || '',
      value: initialData?.value || '',
      description: initialData?.description || '',
    })
    const [errors, setErrors] = React.useState<
      Partial<Record<keyof AlertFormData, string>>
    >({})

    const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof AlertFormData, string>> = {}

      if (!formData.sensorName.trim()) {
        newErrors.sensorName = t.pages.alerts.sensorNameRequired
      }

      if (!formData.value.trim()) {
        newErrors.value = t.pages.alerts.valueRequired
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (validateForm()) {
        onSubmit(formData)
      }
    }

    const handleChange =
      (field: keyof AlertFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
      }

    React.useEffect(() => {
      if (initialData) {
        setFormData({
          sensorName: initialData.sensorName || '',
          value: initialData.value || '',
          description: initialData.description || '',
        })
      }
    }, [initialData])

    React.useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.requestSubmit(),
    }))

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="sensorName">
            {t.pages.alerts.sensorName} *
          </FieldLabel>
          <FieldContent>
            <Input
              id="sensorName"
              value={formData.sensorName}
              onChange={handleChange('sensorName')}
              placeholder={t.pages.alerts.sensorNamePlaceholder}
              disabled={isLoading}
              aria-invalid={!!errors.sensorName}
            />
            {errors.sensorName && <FieldError>{errors.sensorName}</FieldError>}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="value">{t.pages.alerts.value} *</FieldLabel>
          <FieldContent>
            <Input
              id="value"
              value={formData.value}
              onChange={handleChange('value')}
              placeholder={t.pages.alerts.valuePlaceholder}
              disabled={isLoading}
              aria-invalid={!!errors.value}
            />
            {errors.value && <FieldError>{errors.value}</FieldError>}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">
            {t.pages.alerts.description}
          </FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder={t.pages.alerts.descriptionPlaceholder}
              disabled={isLoading}
              rows={3}
            />
          </FieldContent>
        </Field>
      </form>
    )
  }
)

AlertForm.displayName = 'AlertForm'

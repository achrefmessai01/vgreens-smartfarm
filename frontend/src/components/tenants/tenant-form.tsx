'use client'

import * as React from 'react'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { Tenant } from '@/generated/graphql'
import { Checkbox } from '@/components/ui/checkbox'

export interface TenantFormData {
  name: string
  companyName?: string
  email?: string
  phone?: string
  isActive: boolean
}

export interface TenantFormErrors {
  name?: string
  email?: string
}

interface TenantFormProps {
  initialData?: Partial<Tenant>
  onSubmit: (data: TenantFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export interface TenantFormRef {
  submit: () => void
}

export const TenantForm = React.forwardRef<TenantFormRef, TenantFormProps>(
  ({ initialData, onSubmit, onCancel, isLoading = false }, ref) => {
    const formRef = React.useRef<HTMLFormElement>(null)
    const [formData, setFormData] = React.useState<TenantFormData>(
      initialData
        ? {
            name: initialData.name || '',
            companyName: initialData.companyName || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            isActive: initialData.isActive ?? true,
          }
        : {
            name: '',
            companyName: '',
            email: '',
            phone: '',
            isActive: true,
          }
    )
    const [errors, setErrors] = React.useState<TenantFormErrors>({})

    const validateForm = (): boolean => {
      const newErrors: TenantFormErrors = {}

      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = 'Invalid email format'
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
      (field: keyof TenantFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field as keyof typeof errors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
      }

    const handleSwitchChange = (checked: boolean) => {
      setFormData((prev) => ({ ...prev, isActive: checked }))
    }

    React.useImperativeHandle(ref, () => ({
      submit: () => {
        if (formRef.current) {
          formRef.current.requestSubmit()
        }
      },
    }))

    React.useEffect(() => {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          companyName: initialData.companyName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          isActive: initialData.isActive ?? true,
        })
      }
    }, [initialData])

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name *</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Tenant name"
                aria-invalid={!!errors.name}
                disabled={isLoading}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
            <FieldContent>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange('companyName')}
                placeholder="Company name"
                disabled={isLoading}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="contact@company.com"
                aria-invalid={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <FieldContent>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
            </FieldContent>
          </Field>

          <Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
                disabled={isLoading}
              />
              <FieldLabel htmlFor="isActive" className="cursor-pointer">
                Active Status
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </form>
    )
  }
)

TenantForm.displayName = 'TenantForm'

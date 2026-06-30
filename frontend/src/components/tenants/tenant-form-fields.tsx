'use client';

import * as React from 'react';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import type { TenantFormData, TenantFormErrors } from './tenant-form.types';

interface TenantFormFieldsProps {
  formData: TenantFormData;
  errors: TenantFormErrors;
  isLoading?: boolean;
  onChange: (
    field: keyof TenantFormData,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * The four basic tenant text inputs (name, companyName, email, phone). Pulled
 * out of `TenantForm` so the parent stays focused on state wiring + submit and
 * each file stays under the 150-line component cap.
 */
export function TenantFormFields({
  formData,
  errors,
  isLoading = false,
  onChange,
}: TenantFormFieldsProps) {
  const { t } = useI18n();
  const tenantsT = t.pages.admin.tenants;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="name">{`${tenantsT.name} *`}</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={onChange('name')}
            placeholder={tenantsT.namePlaceholder}
            aria-invalid={!!errors.name}
            disabled={isLoading}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="companyName">{tenantsT.companyName}</FieldLabel>
        <FieldContent>
          <Input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={onChange('companyName')}
            placeholder={tenantsT.companyPlaceholder}
            disabled={isLoading}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">{tenantsT.email}</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={onChange('email')}
            placeholder={tenantsT.emailPlaceholder}
            aria-invalid={!!errors.email}
            disabled={isLoading}
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">{tenantsT.phone}</FieldLabel>
        <FieldContent>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={onChange('phone')}
            placeholder={tenantsT.phonePlaceholder}
            disabled={isLoading}
          />
        </FieldContent>
      </Field>
    </>
  );
}

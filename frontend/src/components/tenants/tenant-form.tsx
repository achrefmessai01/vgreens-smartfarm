'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Tenant } from '@/generated/graphql';
import { useFarmConfigQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import * as React from 'react';

export interface TenantFormData {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  bayCount?: number;
  chambersCount?: number;
}

export interface TenantFormErrors {
  name?: string;
  email?: string;
}

interface TenantFormProps {
  initialData?: Partial<Tenant>;
  tenantId?: string;
  onSubmit: (data: TenantFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TenantFormRef {
  submit: () => void;
}

// Greenhouses are no longer edited here — they are managed against the
// dedicated greenhouses table via the Farm Layout Config on the tenant's
// details page (the single source of truth).
export const TenantForm = React.forwardRef<TenantFormRef, TenantFormProps>(
  ({ initialData, tenantId, onSubmit, isLoading = false }, ref) => {
    const { t } = useI18n();
    const tenantsT = t.pages.admin.tenants;
    const formRef = React.useRef<HTMLFormElement>(null);

    const { data: farmConfigData } = useFarmConfigQuery({
      variables: { tenantId },
      skip: !tenantId,
      fetchPolicy: 'cache-and-network',
    });

    const [formData, setFormData] = React.useState<TenantFormData>({
      name: initialData?.name ?? '',
      companyName: initialData?.companyName ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      isActive: initialData?.isActive ?? true,
      bayCount: undefined,
      chambersCount: undefined,
    });
    const [errors, setErrors] = React.useState<TenantFormErrors>({});

    React.useEffect(() => {
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          name: initialData.name ?? '',
          companyName: initialData.companyName ?? '',
          email: initialData.email ?? '',
          phone: initialData.phone ?? '',
          isActive: initialData.isActive ?? true,
        }));
      }
    }, [initialData]);

    React.useEffect(() => {
      const cfg = farmConfigData?.farmConfig;
      if (cfg) {
        setFormData((prev) => ({
          ...prev,
          bayCount: cfg.bayCount,
          chambersCount: cfg.chambersCount,
        }));
      }
    }, [farmConfigData]);

    const validateForm = (): boolean => {
      const newErrors: TenantFormErrors = {};
      if (!formData.name.trim()) newErrors.name = tenantsT.nameRequired;
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = tenantsT.emailInvalid;
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) onSubmit(formData);
    };

    const handleChange =
      (field: keyof TenantFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field as keyof TenantFormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      };

    React.useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.requestSubmit(),
    }));

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">{`${tenantsT.name} *`}</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
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
                onChange={handleChange('companyName')}
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
                onChange={handleChange('email')}
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
                onChange={handleChange('phone')}
                placeholder={tenantsT.phonePlaceholder}
                disabled={isLoading}
              />
            </FieldContent>
          </Field>

          <Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: !!checked }))
                }
                disabled={isLoading}
              />
              <FieldLabel htmlFor="isActive" className="cursor-pointer">
                {tenantsT.activeStatus}
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </form>
    );
  },
);

TenantForm.displayName = 'TenantForm';

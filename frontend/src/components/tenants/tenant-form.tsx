'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { Tenant } from '@/generated/graphql';
import { useFarmConfigQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import * as React from 'react';
import { AllowedDomainsField } from './allowed-domains-field';
import { TenantFormFields } from './tenant-form-fields';
import type {
  TenantFormData,
  TenantFormErrors,
} from './tenant-form.types';

export type { TenantFormData, TenantFormErrors } from './tenant-form.types';

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
      allowedDomains: initialData?.allowedDomains ?? [],
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
          allowedDomains: initialData.allowedDomains ?? [],
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
          <TenantFormFields
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={handleChange}
          />

          <AllowedDomainsField
            value={formData.allowedDomains}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, allowedDomains: next }))
            }
            disabled={isLoading}
          />

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

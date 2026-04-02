'use client';

import * as React from 'react';
import { Columns2, Building } from 'lucide-react';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Tenant } from '@/generated/graphql';
import { useFarmConfigQuery } from '@/generated/graphql';
import { Checkbox } from '@/components/ui/checkbox';
import { DEFAULT_FARM_CONFIG } from '@/lib/farm-config-constants';

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

export const TenantForm = React.forwardRef<TenantFormRef, TenantFormProps>(
  ({ initialData, tenantId, onSubmit, isLoading = false }, ref) => {
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
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Invalid email format';
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

    const handleNumberChange =
      (field: 'bayCount' | 'chambersCount') =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const n = parseInt(e.target.value, 10);
        setFormData((prev) => ({
          ...prev,
          [field]: Number.isFinite(n) && n > 0 ? n : undefined,
        }));
      };

    React.useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.requestSubmit(),
    }));

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
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: !!checked }))
                }
                disabled={isLoading}
              />
              <FieldLabel htmlFor="isActive" className="cursor-pointer">
                Active Status
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>

        <Separator />

        <div>
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            Farm Layout
          </p>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="bayCount"
                className="flex items-center gap-1.5"
              >
                <Columns2 className="text-muted-foreground h-3.5 w-3.5" />
                Total Bays
              </FieldLabel>
              <FieldContent>
                <Input
                  id="bayCount"
                  type="number"
                  min={1}
                  value={formData.bayCount ?? DEFAULT_FARM_CONFIG.bayCount}
                  onChange={handleNumberChange('bayCount')}
                  placeholder={String(DEFAULT_FARM_CONFIG.bayCount)}
                  className="w-32"
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel
                htmlFor="chambersCount"
                className="flex items-center gap-1.5"
              >
                <Building className="text-muted-foreground h-3.5 w-3.5" />
                Number of Greenhouses
              </FieldLabel>
              <FieldContent>
                <Input
                  id="chambersCount"
                  type="number"
                  min={1}
                  value={
                    formData.chambersCount ?? DEFAULT_FARM_CONFIG.chambersCount
                  }
                  onChange={handleNumberChange('chambersCount')}
                  placeholder={String(DEFAULT_FARM_CONFIG.chambersCount)}
                  className="w-32"
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
      </form>
    );
  },
);

TenantForm.displayName = 'TenantForm';

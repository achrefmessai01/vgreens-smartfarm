'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { DoorPosition, Tenant } from '@/generated/graphql';
import {
  DoorPosition as DoorPositionEnum,
  useFarmConfigQuery,
} from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { DEFAULT_FARM_CONFIG } from '@/lib/farm-config-constants';
import { Building, Columns2, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

// Convert enum key to human-readable label (e.g., "BottomLeft" -> "Bottom Left")
const formatDoorPositionLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};

const DOOR_POSITION_OPTIONS = Object.entries(DoorPositionEnum).map(
  ([key, value]) => ({
    value,
    label: formatDoorPositionLabel(key),
  }),
);

export interface TenantGreenhouseFormData {
  name: string;
  doorPosition?: DoorPosition;
  xDimension?: number;
  yDimension?: number;
  bayCount?: number;
}

export interface TenantFormData {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  bayCount?: number;
  chambersCount?: number;
  greenhouses: TenantGreenhouseFormData[];
}

export interface TenantFormErrors {
  name?: string;
  email?: string;
  greenhouses?: string;
}

interface TenantFormProps {
  initialData?: Partial<Tenant> & {
    greenhouses?: Array<{
      name?: string | null;
      doorPosition?: DoorPosition | null;
      xDimension?: number | null;
      yDimension?: number | null;
      bayCount?: number | null;
    }> | null;
  };
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
      greenhouses:
        initialData?.greenhouses?.map((greenhouse) => ({
          name: greenhouse.name ?? '',
          doorPosition: greenhouse.doorPosition ?? undefined,
          xDimension: greenhouse.xDimension ?? undefined,
          yDimension: greenhouse.yDimension ?? undefined,
          bayCount: greenhouse.bayCount ?? undefined,
        })) ?? [],
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
          greenhouses:
            initialData.greenhouses?.map((greenhouse) => ({
              name: greenhouse.name ?? '',
              doorPosition: greenhouse.doorPosition ?? undefined,
              xDimension: greenhouse.xDimension ?? undefined,
              yDimension: greenhouse.yDimension ?? undefined,
              bayCount: greenhouse.bayCount ?? undefined,
            })) ?? [],
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
      if (
        formData.greenhouses.some(
          (greenhouse) =>
            !greenhouse.name.trim() ||
            greenhouse.xDimension == null ||
            greenhouse.yDimension == null ||
            greenhouse.xDimension <= 0 ||
            greenhouse.yDimension <= 0,
        )
      ) {
        newErrors.greenhouses = tenantsT.greenhousesInvalid;
      }
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

    const addGreenhouse = () => {
      setFormData((prev) => ({
        ...prev,
        greenhouses: [
          ...prev.greenhouses,
          {
            name: '',
            doorPosition: undefined,
            xDimension: undefined,
            yDimension: undefined,
            bayCount: undefined,
          },
        ],
      }));
      if (errors.greenhouses) {
        setErrors((prev) => ({ ...prev, greenhouses: undefined }));
      }
    };

    const removeGreenhouse = (index: number) => {
      setFormData((prev) => ({
        ...prev,
        greenhouses: prev.greenhouses.filter((_, i) => i !== index),
      }));
      if (errors.greenhouses) {
        setErrors((prev) => ({ ...prev, greenhouses: undefined }));
      }
    };

    const handleGreenhouseChange =
      (
        index: number,
        field: keyof TenantGreenhouseFormData,
        isNumber = false,
      ) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = isNumber
          ? (() => {
              const n = parseFloat(e.target.value);
              return Number.isFinite(n) ? n : undefined;
            })()
          : e.target.value;
        setFormData((prev) => ({
          ...prev,
          greenhouses: prev.greenhouses.map((greenhouse, i) =>
            i === index ? { ...greenhouse, [field]: value } : greenhouse,
          ),
        }));
        if (errors.greenhouses) {
          setErrors((prev) => ({ ...prev, greenhouses: undefined }));
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

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {tenantsT.farmLayout.title}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGreenhouse}
              disabled={isLoading}
            >
              <Plus className="mr-1 h-4 w-4" />
              {tenantsT.farmLayout.add}
            </Button>
          </div>

          {formData.greenhouses.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {tenantsT.farmLayout.noGreenhouses}
            </p>
          )}

          <div className="space-y-3">
            {formData.greenhouses.map((greenhouse, index) => (
              <div
                key={`greenhouse-${index}`}
                className="rounded-md border p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {`${tenantsT.farmLayout.greenhouseLabel} ${index + 1}`}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGreenhouse(index)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Input
                    type="text"
                    value={greenhouse.name}
                    onChange={handleGreenhouseChange(index, 'name')}
                    placeholder={tenantsT.farmLayout.namePlaceholder}
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={greenhouse.xDimension ?? ''}
                    onChange={handleGreenhouseChange(index, 'xDimension', true)}
                    placeholder={tenantsT.farmLayout.xDimensionPlaceholder}
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={greenhouse.yDimension ?? ''}
                    onChange={handleGreenhouseChange(index, 'yDimension', true)}
                    placeholder={tenantsT.farmLayout.yDimensionPlaceholder}
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    min={1}
                    step="1"
                    value={greenhouse.bayCount ?? ''}
                    onChange={handleGreenhouseChange(index, 'bayCount', true)}
                    placeholder={tenantsT.farmLayout.bayCountPlaceholder}
                    disabled={isLoading}
                  />
                  <Select
                    value={greenhouse.doorPosition ?? ''}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        greenhouses: prev.greenhouses.map((gh, i) =>
                          i === index
                            ? { ...gh, doorPosition: value as DoorPosition }
                            : gh,
                        ),
                      }));
                      if (errors.greenhouses) {
                        setErrors((prev) => ({
                          ...prev,
                          greenhouses: undefined,
                        }));
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={tenantsT.farmLayout.doorPositionPlaceholder}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {DOOR_POSITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          {errors.greenhouses && <FieldError>{errors.greenhouses}</FieldError>}
        </div>
      </form>
    );
  },
);

TenantForm.displayName = 'TenantForm';

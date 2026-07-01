'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import type {
  UserFormData,
  UserFormErrors,
} from '@/components/users/user-form-types';
import { UserRole } from '@/generated/graphql';
import type { User } from '@/generated/graphql';

interface UseUserManagementFormProps {
  initialData?: Partial<User>;
  hideTenantSelection?: boolean;
  onSubmit: (data: UserFormData) => void | Promise<void>;
}

/** Pull a readable message out of a failed create/update (Apollo error). */
function getSubmitErrorMessage(error: unknown): string {
  const e = error as {
    graphQLErrors?: { message?: string }[];
    message?: string;
  };
  return e?.graphQLErrors?.[0]?.message || e?.message || 'Failed to save user';
}

export function useUserManagementForm({
  initialData,
  hideTenantSelection = false,
  onSubmit,
}: UseUserManagementFormProps) {
  const { t } = useI18n();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [formData, setFormData] = React.useState<UserFormData>(
    initialData
      ? {
          email: initialData.email || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          imageUrl: initialData.imageUrl || '',
          role: initialData.role,
          tenantId: initialData.tenantId || '',
          isActive: initialData.isActive ?? true,
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          imageUrl: '',
          role: undefined,
          tenantId: '',
          isActive: true,
        },
  );
  const [errors, setErrors] = React.useState<UserFormErrors>({});

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        imageUrl: initialData.imageUrl || '',
        role: initialData.role,
        tenantId: initialData.tenantId || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};

    if (!initialData && !formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.pages.users.emailInvalid;
    }

    if (!formData.role) {
      newErrors.role = t.pages.admin.users.roleRequired || 'Role is required';
    }

    if (
      !hideTenantSelection &&
      formData.role &&
      formData.role !== UserRole.VgreensAdmin &&
      formData.role !== UserRole.VgreensMember &&
      !formData.tenantId
    ) {
      newErrors.tenantId = t.pages.admin.users.tenantRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isVGreensRole =
      formData.role === UserRole.VgreensAdmin ||
      formData.role === UserRole.VgreensMember;
    const submitData: UserFormData = {
      ...formData,
      tenantId:
        isVGreensRole || hideTenantSelection ? undefined : formData.tenantId,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      // A failed creation (e.g. the admin email-domain rule rejecting it) is
      // shown on the email field — red border + the backend's message.
      setErrors((prev) => ({ ...prev, email: getSubmitErrorMessage(error) }));
    }
  };

  const handleChange =
    (field: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value || undefined }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const submit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return {
    formRef,
    formData,
    errors,
    handleSubmit,
    handleChange,
    handleSelectChange,
    handleCheckboxChange,
    submit,
  };
}

'use client';

import {
  RoleField,
  EmailField,
  NameFields,
  ImageUrlField,
  ActiveStatusField,
} from './user-form-fields';
import * as React from 'react';
import { UserRole } from '@/generated/graphql';
import { FieldGroup } from '@/components/ui/field';
import type { User, Tenant } from '@/generated/graphql';
import type { UserFormData, UserFormErrors } from './user-form-types';
import { useUserManagementForm } from '@/lib/hooks/use-user-management-form';
import { TenantWithDomainWarning } from './tenant-with-domain-warning';

export type { UserFormData, UserFormErrors };

interface UserManagementFormProps {
  initialData?: Partial<User>;
  tenants?: Tenant[];
  isVGreensAdmin?: boolean;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  allowedRoles?: UserRole[];
  hideTenantSelection?: boolean;
}

export interface UserManagementFormRef {
  submit: () => void;
}

export const UserManagementForm = React.forwardRef<
  UserManagementFormRef,
  UserManagementFormProps
>(
  (
    {
      initialData,
      tenants = [],
      isVGreensAdmin = false,
      onSubmit,
      onCancel,
      isLoading = false,
      allowedRoles,
      hideTenantSelection = false,
    },
    ref,
  ) => {
    const {
      formRef,
      formData,
      errors,
      handleSubmit,
      handleChange,
      handleSelectChange,
      handleCheckboxChange,
      submit,
    } = useUserManagementForm({
      initialData,
      hideTenantSelection,
      onSubmit,
    });

    React.useImperativeHandle(ref, () => ({ submit }));

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <EmailField
            value={formData.email}
            onChange={handleChange('email')}
            errors={errors}
            isLoading={isLoading}
            isEditMode={!!initialData}
          />

          <NameFields
            firstName={formData.firstName || ''}
            lastName={formData.lastName || ''}
            onFirstNameChange={handleChange('firstName')}
            onLastNameChange={handleChange('lastName')}
            errors={errors}
            isLoading={isLoading}
          />

          <ImageUrlField
            value={formData.imageUrl || ''}
            onChange={handleChange('imageUrl')}
            errors={errors}
            isLoading={isLoading}
          />

          <RoleField
            value={formData.role}
            onChange={handleSelectChange('role')}
            errors={errors}
            isLoading={isLoading}
            allowedRoles={allowedRoles}
            isVGreensAdmin={isVGreensAdmin}
          />

          {!hideTenantSelection &&
            isVGreensAdmin &&
            formData.role !== UserRole.VgreensAdmin &&
            formData.role !== UserRole.VgreensMember && (
              <TenantWithDomainWarning
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                tenants={tenants}
                originalTenantId={initialData?.tenantId}
                onChange={handleSelectChange('tenantId')}
              />
            )}

          <ActiveStatusField
            checked={formData.isActive ?? true}
            onChange={handleCheckboxChange}
            isLoading={isLoading}
          />
        </FieldGroup>
      </form>
    );
  },
);

UserManagementForm.displayName = 'UserManagementForm';

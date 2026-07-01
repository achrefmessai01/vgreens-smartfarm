'use client';

import type {
  RoleFieldProps,
  EmailFieldProps,
  NameFieldsProps,
  TenantFieldProps,
  ImageUrlFieldProps,
  ActiveStatusFieldProps,
} from './user-form-types';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/generated/graphql';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectField, type SelectOption } from './select-field';

export function EmailField({
  value,
  onChange,
  errors,
  isLoading,
  isEditMode,
}: EmailFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="email">
        {t.pages.admin.users.emailRequired}
      </FieldLabel>
      <FieldContent>
        <Input
          id="email"
          type="email"
          value={value}
          onChange={onChange}
          placeholder={t.pages.admin.users.emailPlaceholder}
          aria-invalid={!!errors.email}
          disabled={isLoading || isEditMode}
        />
        {errors.email && <FieldError>{errors.email}</FieldError>}
        {!isEditMode && (
          <p className="text-muted-foreground mt-1 text-xs">
            {t.pages.admin.users.invitationEmailDescription}
          </p>
        )}
      </FieldContent>
    </Field>
  );
}

export function NameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  isLoading,
}: NameFieldsProps) {
  const { t } = useI18n();
  return (
    <>
      <Field>
        <FieldLabel htmlFor="firstName">
          {t.pages.admin.users.firstName}
        </FieldLabel>
        <FieldContent>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={onFirstNameChange}
            placeholder={t.pages.admin.users.firstNamePlaceholder}
            disabled={isLoading}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="lastName">
          {t.pages.admin.users.lastName}
        </FieldLabel>
        <FieldContent>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={onLastNameChange}
            placeholder={t.pages.admin.users.lastNamePlaceholder}
            disabled={isLoading}
          />
        </FieldContent>
      </Field>
    </>
  );
}

export function ImageUrlField({
  value,
  onChange,
  isLoading,
}: ImageUrlFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <FieldLabel htmlFor="imageUrl">{t.pages.admin.users.imageUrl}</FieldLabel>
      <FieldContent>
        <Input
          id="imageUrl"
          type="url"
          value={value}
          onChange={onChange}
          placeholder={t.pages.admin.users.imageUrlPlaceholder}
          disabled={isLoading}
        />
      </FieldContent>
    </Field>
  );
}

export function RoleField({
  value,
  onChange,
  errors,
  isLoading,
  allowedRoles,
  isVGreensAdmin,
}: RoleFieldProps) {
  const { t } = useI18n();

  const roleOptions: SelectOption[] = [];

  if (
    (!allowedRoles || allowedRoles.includes(UserRole.VgreensAdmin)) &&
    isVGreensAdmin
  ) {
    roleOptions.push({
      value: UserRole.VgreensAdmin,
      label: t.pages.admin.users.roleVgreensAdmin,
    });
  }

  if (
    (!allowedRoles || allowedRoles.includes(UserRole.VgreensMember)) &&
    isVGreensAdmin
  ) {
    roleOptions.push({
      value: UserRole.VgreensMember,
      label: t.pages.admin.users.roleVgreensMember,
    });
  }

  if (!allowedRoles || allowedRoles.includes(UserRole.TenantAdmin)) {
    roleOptions.push({
      value: UserRole.TenantAdmin,
      label: t.pages.admin.users.roleTenantAdmin,
    });
  }

  if (!allowedRoles || allowedRoles.includes(UserRole.TenantUser)) {
    roleOptions.push({
      value: UserRole.TenantUser,
      label: t.pages.admin.users.roleTenantUser,
    });
  }

  return (
    <SelectField
      id="role"
      label={t.pages.admin.users.roleRequired}
      value={value}
      onChange={onChange}
      options={roleOptions}
      placeholder={t.pages.admin.users.selectRole}
      errors={errors}
      errorKey="role"
      isLoading={isLoading}
      required
    />
  );
}

export function TenantField({
  value,
  onChange,
  errors,
  isLoading,
  tenants,
}: TenantFieldProps) {
  const { t } = useI18n();

  const tenantOptions: SelectOption[] = tenants.map((tenant) => ({
    value: tenant.id,
    label: tenant.name,
  }));

  return (
    <SelectField
      id="tenantId"
      label={t.pages.admin.users.tenantRequired}
      value={value}
      onChange={onChange}
      options={tenantOptions}
      placeholder={t.pages.admin.users.selectTenant}
      errors={errors}
      errorKey="tenantId"
      isLoading={isLoading}
      required
    />
  );
}

export function ActiveStatusField({
  checked,
  onChange,
  isLoading,
}: ActiveStatusFieldProps) {
  const { t } = useI18n();
  return (
    <Field>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isActive"
          checked={checked}
          onCheckedChange={onChange}
          disabled={isLoading}
        />
        <FieldLabel htmlFor="isActive" className="cursor-pointer">
          {t.pages.admin.users.activeStatus}
        </FieldLabel>
      </div>
    </Field>
  );
}

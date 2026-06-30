'use client';

import * as React from 'react';
import type { Tenant } from '@/generated/graphql';
import { TenantField } from './user-form-fields';
import { DomainWarning } from './domain-warning';
import type { UserFormData, UserFormErrors } from './user-form-types';

interface TenantWithDomainWarningProps {
  formData: UserFormData;
  errors: UserFormErrors;
  isLoading: boolean;
  tenants: Tenant[];
  /** The user's original tenantId (only set in edit mode). */
  originalTenantId?: string | null;
  onChange: (value: string) => void;
}

/**
 * Pairs the tenant picker with the domain advisory beneath it so the parent
 * form stays under the 150-line cap and the warning logic (looking up the
 * selected tenant's allowedDomains, detecting tenant transfers) lives next to
 * the field it annotates.
 */
export function TenantWithDomainWarning({
  formData,
  errors,
  isLoading,
  tenants,
  originalTenantId,
  onChange,
}: TenantWithDomainWarningProps) {
  const selected = tenants.find((t) => t.id === formData.tenantId);
  const isTransfer =
    !!originalTenantId &&
    !!formData.tenantId &&
    originalTenantId !== formData.tenantId;
  return (
    <>
      <TenantField
        value={formData.tenantId}
        onChange={onChange}
        errors={errors}
        isLoading={isLoading}
        tenants={tenants}
      />
      <DomainWarning
        email={formData.email}
        allowedDomains={selected?.allowedDomains}
        isTransfer={isTransfer}
      />
    </>
  );
}

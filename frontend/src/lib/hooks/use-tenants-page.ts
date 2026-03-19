'use client';

import * as React from 'react';
import {
  useTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  type Tenant,
} from '@/generated/graphql';
import { useRouter } from 'next/navigation';
import type { TenantFormData } from '@/components/tenants/tenant-form';

export function useTenantsPage() {
  const router = useRouter();
  const { data, loading, refetch } = useTenantsQuery();
  const [createTenant] = useCreateTenantMutation();
  const [updateTenant] = useUpdateTenantMutation();
  const [deleteTenant] = useDeleteTenantMutation();

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingTenant, setEditingTenant] = React.useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    tenant: Tenant | null;
    isOpen: boolean;
  }>({ tenant: null, isOpen: false });

  const tenants = data?.tenants || [];

  const handleCreate = React.useCallback(() => {
    setEditingTenant(null);
    setIsSheetOpen(true);
  }, []);

  const handleEdit = React.useCallback((tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsSheetOpen(true);
  }, []);

  const handleDelete = React.useCallback((tenant: Tenant) => {
    setDeleteConfirmation({ tenant, isOpen: true });
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsSheetOpen(false);
    setEditingTenant(null);
  }, []);

  const handleManageFeatures = React.useCallback(
    (tenant: Tenant) => {
      router.push(`/admin/tenants/${tenant.id}/features`);
    },
    [router],
  );

  const handleRowClick = React.useCallback(
    (tenant: Tenant) => {
      router.push(`/tenant/farm-overview?tenantId=${tenant.id}`);
    },
    [router],
  );

  const confirmDelete = React.useCallback(async () => {
    if (!deleteConfirmation.tenant) return;
    setIsLoading(true);
    try {
      await deleteTenant({ variables: { id: deleteConfirmation.tenant.id } });
      await refetch();
      setDeleteConfirmation({ tenant: null, isOpen: false });
    } catch (error) {
      console.error('Error deleting tenant:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmation.tenant, deleteTenant, refetch]);

  const handleSubmit = React.useCallback(
    async (formData: TenantFormData) => {
      setIsLoading(true);
      try {
        if (editingTenant) {
          await updateTenant({ variables: { id: editingTenant.id, input: formData } });
        } else {
          await createTenant({ variables: { input: formData } });
        }
        await refetch();
        setIsSheetOpen(false);
        setEditingTenant(null);
      } catch (error) {
        console.error('Error saving tenant:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingTenant, createTenant, updateTenant, refetch],
  );

  return {
    tenants,
    loading,
    isLoading,
    editingTenant,
    isSheetOpen,
    setIsSheetOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    confirmDelete,
    handleManageFeatures,
    handleRowClick,
  };
}

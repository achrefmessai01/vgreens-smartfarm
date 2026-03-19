'use client';

import { PageHeader } from '@/components/layout';
import {
  TenantForm,
  TenantTable,
  type TenantFormRef,
} from '@/components/tenants';
import type { TenantFormData } from '@/components/tenants/tenant-form';
import { Button } from '@/components/ui/button';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmationDialog } from '@/components/users';
import type { Tenant } from '@/generated/graphql';
import {
  useCreateTenantMutation,
  useDeleteTenantMutation,
  useTenantsQuery,
  useUpdateTenantMutation,
} from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function TenantsPage() {
  const { t } = useI18n();
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
  const formRef = React.useRef<TenantFormRef>(null);

  const tenants = data?.tenants || [];

  const handleCreate = () => {
    setEditingTenant(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsSheetOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setDeleteConfirmation({ tenant, isOpen: true });
  };

  const handleManageFeatures = (tenant: Tenant) => {
    router.push(`/admin/tenants/${tenant.id}/features`);
  };

  const handleRowClick = (tenant: Tenant) => {
    router.push(`/tenant/farm-overview?tenantId=${tenant.id}`);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.tenant) {
      setIsLoading(true);
      try {
        await deleteTenant({
          variables: { id: deleteConfirmation.tenant.id },
        });
        await refetch();
        setDeleteConfirmation({ tenant: null, isOpen: false });
      } catch (error) {
        console.error('Error deleting tenant:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (formData: TenantFormData) => {
    setIsLoading(true);
    try {
      if (editingTenant) {
        await updateTenant({
          variables: {
            id: editingTenant.id,
            input: formData,
          },
        });
      } else {
        await createTenant({
          variables: {
            input: formData,
          },
        });
      }
      await refetch();
      setIsSheetOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Error saving tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsSheetOpen(false);
    setEditingTenant(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 h-full min-h-0">
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={5} rowCount={8} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <PageHeader
        title={t.pages.admin.tenants.title}
        subtitle={t.pages.admin.tenants.subtitle}
      />

      <div className="flex-1 min-h-0">
        <TenantTable
          tenants={tenants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onManageFeatures={handleManageFeatures}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
            <SheetTitle className="dark:text-card-foreground">
              {editingTenant
                ? t.pages.admin.tenants.editTenant
                : t.pages.admin.tenants.createTenant}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TenantForm
              ref={formRef}
              initialData={editingTenant || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>

          <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.users.cancel}
            </Button>
            <Button
              onClick={() => formRef.current?.submit()}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? '...'
                : editingTenant
                  ? t.pages.admin.tenants.updateTenant
                  : t.pages.admin.tenants.createTenant}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({ tenant: null, isOpen: open })
        }
        title={t.pages.admin.tenants.deleteTenant}
        description={
          t.pages.admin.tenants.deleteDescription ||
          'Are you sure you want to delete this tenant? This action cannot be undone.'
        }
        confirmLabel={t.pages.users.delete}
        cancelLabel={t.pages.users.cancel}
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation({ tenant: null, isOpen: false })}
      >
        {deleteConfirmation.tenant && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
              <p className="font-medium dark:text-card-foreground">
                {deleteConfirmation.tenant.name}
              </p>
              {deleteConfirmation.tenant.companyName && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {deleteConfirmation.tenant.companyName}
                </p>
              )}
              {deleteConfirmation.tenant.email && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {deleteConfirmation.tenant.email}
                </p>
              )}
            </div>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  TenantTable,
  TenantForm,
  type TenantFormRef,
} from '@/components/tenants';
import { ConfirmationDialog } from '@/components/users';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import { useTenantsPage } from '@/lib/hooks/use-tenants-page';

export default function TenantsPage() {
  const { t } = useI18n();
  const formRef = React.useRef<TenantFormRef>(null);
  const page = useTenantsPage();

  if (page.loading) {
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
          tenants={page.tenants}
          onEdit={page.handleEdit}
          onDelete={page.handleDelete}
          onCreate={page.handleCreate}
          onManageFeatures={page.handleManageFeatures}
          onRowClick={page.handleRowClick}
        />
      </div>

      <Sheet open={page.isSheetOpen} onOpenChange={page.setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
            <SheetTitle className="dark:text-card-foreground">
              {page.editingTenant
                ? t.pages.admin.tenants.editTenant
                : t.pages.admin.tenants.createTenant}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TenantForm
              ref={formRef}
              initialData={page.editingTenant || undefined}
              onSubmit={page.handleSubmit}
              onCancel={page.handleCancel}
              isLoading={page.isLoading}
            />
          </div>
          <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
            <Button
              variant="outline"
              onClick={page.handleCancel}
              disabled={page.isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.users.cancel}
            </Button>
            <Button
              onClick={() => formRef.current?.submit()}
              disabled={page.isLoading}
              className="flex-1"
            >
              {page.isLoading
                ? '...'
                : page.editingTenant
                  ? t.pages.admin.tenants.updateTenant
                  : t.pages.admin.tenants.createTenant}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        open={page.deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          page.setDeleteConfirmation({ tenant: null, isOpen: open })
        }
        title={t.pages.admin.tenants.deleteTenant}
        description={
          t.pages.admin.tenants.deleteDescription ||
          'Are you sure you want to delete this tenant? This action cannot be undone.'
        }
        confirmLabel={t.pages.users.delete}
        cancelLabel={t.pages.users.cancel}
        variant="destructive"
        onConfirm={page.confirmDelete}
        onCancel={() =>
          page.setDeleteConfirmation({ tenant: null, isOpen: false })
        }
      >
        {page.deleteConfirmation.tenant && (
          <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
            <p className="font-medium dark:text-card-foreground">
              {page.deleteConfirmation.tenant.name}
            </p>
            {page.deleteConfirmation.tenant.companyName && (
              <p className="text-sm text-muted-foreground mt-1">
                {page.deleteConfirmation.tenant.companyName}
              </p>
            )}
            {page.deleteConfirmation.tenant.email && (
              <p className="text-sm text-muted-foreground mt-1">
                {page.deleteConfirmation.tenant.email}
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}

'use client';

import { PageHeader } from '@/components/layout';
import {
  TenantForm,
  TenantTable,
  type TenantFormRef,
} from '@/components/tenants';
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
import { useI18n } from '@/i18n';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useTenantsPage } from '@/lib/hooks/use-tenants-page';
import * as React from 'react';

export default function TenantsPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const formRef = React.useRef<TenantFormRef>(null);
  const page = useTenantsPage();

  if (page.loading) {
    return (
      <div
        className={
          isMobile
            ? 'flex flex-col gap-6'
            : 'flex h-full min-h-0 flex-col gap-6'
        }
      >
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={5} rowCount={8} />
      </div>
    );
  }

  return (
    <div
      className={
        isMobile ? 'flex flex-col gap-6' : 'flex h-full min-h-0 flex-col gap-6'
      }
    >
      <PageHeader
        title={t.pages.admin.tenants.title}
        subtitle={t.pages.admin.tenants.subtitle}
      />

      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
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
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
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
              tenantId={page.editingTenant?.id}
              onSubmit={page.handleSubmit}
              onCancel={page.handleCancel}
              isLoading={page.isLoading}
            />
          </div>
          <SheetFooter className="dark:border-primary-foreground/30 flex-row gap-2 border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={page.handleCancel}
              disabled={page.isLoading}
              className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 flex-1"
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
          <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
            <p className="dark:text-card-foreground font-medium">
              {page.deleteConfirmation.tenant.name}
            </p>
            {page.deleteConfirmation.tenant.companyName && (
              <p className="text-muted-foreground mt-1 text-sm">
                {page.deleteConfirmation.tenant.companyName}
              </p>
            )}
            {page.deleteConfirmation.tenant.email && (
              <p className="text-muted-foreground mt-1 text-sm">
                {page.deleteConfirmation.tenant.email}
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}

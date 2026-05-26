'use client';

import { PageHeader } from '@/components/layout';
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
import {
  ConfirmationDialog,
  UserManagementForm,
  UserManagementTable,
  type UserManagementFormRef,
} from '@/components/users';
import { FeatureGuard } from '@/components/features/feature-guard';
import { useI18n } from '@/i18n';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useTenantUsersPage } from '@/lib/hooks/use-tenant-users-page';
import * as React from 'react';

export default function TenantUsersPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const formRef = React.useRef<UserManagementFormRef>(null);
  const page = useTenantUsersPage();

  if (page.loading) {
    return (
      <div className="space-y-6">
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={5} rowCount={8} />
      </div>
    );
  }

  return (
    <FeatureGuard featureKey="user_management">
      <div
        className={
          isMobile
            ? 'flex flex-col gap-6'
            : 'flex h-full min-h-0 flex-col gap-6'
        }
      >
        <PageHeader
          title={t.pages.users.title}
          subtitle={t.pages.users.subtitleTenant}
        />

        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <UserManagementTable
            users={page.users}
            onEdit={page.handleEdit}
            onDelete={page.handleDelete}
            onCreate={page.handleCreate}
            isLoading={page.isLoading}
            hideTenantColumn={true}
          />
        </div>

        <Sheet open={page.isSheetOpen} onOpenChange={page.setIsSheetOpen}>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
          >
            <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
              <SheetTitle className="dark:text-card-foreground">
                {page.editingUser
                  ? t.pages.admin.users.editUser
                  : t.pages.admin.users.createUser}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <UserManagementForm
                ref={formRef}
                initialData={page.editingUser || undefined}
                onSubmit={page.handleSubmit}
                onCancel={page.handleCancel}
                isLoading={page.isLoading}
                allowedRoles={page.allowedRoles}
                hideTenantSelection={true}
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
                  : page.editingUser
                    ? t.pages.admin.users.updateUser
                    : t.pages.admin.users.createUser}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <ConfirmationDialog
          open={page.deleteConfirmation.isOpen}
          onOpenChange={(open) =>
            page.setDeleteConfirmation({ user: null, isOpen: open })
          }
          title={t.pages.admin.users.deleteUser}
          description={t.pages.users.confirmDeleteTenantDescription}
          confirmLabel={t.pages.users.delete}
          cancelLabel={t.pages.users.cancel}
          variant="destructive"
          onConfirm={page.confirmDelete}
          onCancel={() =>
            page.setDeleteConfirmation({ user: null, isOpen: false })
          }
        >
          {page.deleteConfirmation.user && (
            <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
              <p className="dark:text-card-foreground font-medium">
                {page.deleteConfirmation.user.firstName &&
                page.deleteConfirmation.user.lastName
                  ? `${page.deleteConfirmation.user.firstName} ${page.deleteConfirmation.user.lastName}`
                  : page.deleteConfirmation.user.email ||
                    t.pages.users.unknownUser}
              </p>
              {page.deleteConfirmation.user.email && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {page.deleteConfirmation.user.email}
                </p>
              )}
            </div>
          )}
        </ConfirmationDialog>
      </div>
    </FeatureGuard>
  );
}

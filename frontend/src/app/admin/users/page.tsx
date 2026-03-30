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
  type UserManagementFormRef,
} from '@/components/users';
import { UserManagementTable } from '@/components/users/user-management-table';
import { useI18n } from '@/i18n';
import { useAdminUsersPage } from '@/lib/hooks/use-admin-users-page';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import * as React from 'react';

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const formRef = React.useRef<UserManagementFormRef>(null);
  const page = useAdminUsersPage();

  if (page.loading) {
    return (
      <div
        className={
          isMobile
            ? 'flex flex-col gap-6'
            : 'flex flex-col gap-6 h-full min-h-0'
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
        isMobile ? 'flex flex-col gap-6' : 'flex flex-col gap-6 h-full min-h-0'
      }
    >
      <PageHeader
        title={t.pages.admin.users.title}
        subtitle={t.pages.admin.users.subtitle}
      />

      <div className={isMobile ? '' : 'flex-1 min-h-0'}>
        <UserManagementTable
          users={page.users}
          onEdit={page.handleEdit}
          onDelete={page.handleDelete}
          onCreate={page.handleCreate}
        />
      </div>

      <Sheet open={page.isSheetOpen} onOpenChange={page.setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
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
              tenants={page.tenants}
              isVGreensAdmin={page.isVGreensAdmin}
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
        description={t.pages.users.confirmDeleteDescription}
        confirmLabel={t.pages.users.delete}
        cancelLabel={t.pages.users.cancel}
        variant="destructive"
        onConfirm={page.confirmDelete}
        onCancel={() =>
          page.setDeleteConfirmation({ user: null, isOpen: false })
        }
      >
        {page.deleteConfirmation.user && (
          <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
            <p className="font-medium dark:text-card-foreground">
              {[
                page.deleteConfirmation.user.firstName,
                page.deleteConfirmation.user.lastName,
              ]
                .filter(Boolean)
                .join(' ') || t.pages.admin.users.notAvailable}
            </p>
            {page.deleteConfirmation.user.email && (
              <p className="text-sm text-muted-foreground mt-1">
                {page.deleteConfirmation.user.email}
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}

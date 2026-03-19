'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTitle,
  SheetFooter,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet';
import {
  UserManagementTable,
  UserManagementForm,
  ConfirmationDialog,
  type UserManagementFormRef,
} from '@/components/users';
import { useTenantUsersPage } from '@/lib/hooks/use-tenant-users-page';

export default function TenantUsersPage() {
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
    <div className="flex flex-col gap-6 h-full min-h-0">
      <PageHeader
        title="User Management"
        subtitle="Manage users for your tenant"
      />

      <div className="flex-1 min-h-0">
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
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
            <SheetTitle className="dark:text-card-foreground">
              {page.editingUser ? 'Edit User' : 'Create User'}
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
          <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
            <Button
              variant="outline"
              onClick={page.handleCancel}
              disabled={page.isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => formRef.current?.submit()}
              disabled={page.isLoading}
              className="flex-1"
            >
              {page.isLoading
                ? '...'
                : page.editingUser
                  ? 'Update User'
                  : 'Create User'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        open={page.deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          page.setDeleteConfirmation({ user: null, isOpen: open })
        }
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={page.confirmDelete}
        onCancel={() =>
          page.setDeleteConfirmation({ user: null, isOpen: false })
        }
      >
        {page.deleteConfirmation.user && (
          <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
            <p className="font-medium dark:text-card-foreground">
              {page.deleteConfirmation.user.firstName &&
              page.deleteConfirmation.user.lastName
                ? `${page.deleteConfirmation.user.firstName} ${page.deleteConfirmation.user.lastName}`
                : page.deleteConfirmation.user.email || 'Unknown User'}
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

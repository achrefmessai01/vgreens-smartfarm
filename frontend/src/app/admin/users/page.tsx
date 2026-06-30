'use client';

import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import {
  UserConfirmationDialog,
  UserManagementSheet,
} from '@/components/users';
import { UserManagementTable } from '@/components/users/user-management-table';
import { useI18n } from '@/i18n';
import { useAdminUsersPage } from '@/lib/hooks/use-admin-users-page';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import * as React from 'react';

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const page = useAdminUsersPage();

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
        title={t.pages.admin.users.title}
        subtitle={t.pages.admin.users.subtitle}
        actions={
          <Button
            onClick={page.handleCreate}
            disabled={page.isLoading}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t.pages.admin.users.createUser}
          </Button>
        }
      />

      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
        <UserManagementTable
          users={page.users}
          tenants={page.tenants}
          onEdit={page.handleEdit}
          onDelete={page.handleDelete}
        />
      </div>

      <UserManagementSheet
        open={page.isSheetOpen}
        onOpenChange={page.setIsSheetOpen}
        editingUser={page.editingUser}
        tenants={page.tenants}
        isVGreensAdmin={page.isVGreensAdmin}
        isLoading={page.isLoading}
        onSubmit={page.handleSubmit}
        onCancel={page.handleCancel}
      />

      <UserConfirmationDialog
        user={page.updateConfirmation.user}
        open={page.updateConfirmation.isOpen}
        onOpenChange={(open) =>
          page.setUpdateConfirmation({
            user: open ? page.updateConfirmation.user : null,
            formData: open ? page.updateConfirmation.formData : null,
            isOpen: open,
          })
        }
        title={t.pages.users.confirmUpdate}
        description={t.pages.users.confirmUpdateDescription}
        confirmLabel={t.pages.admin.users.updateUser}
        cancelLabel={t.pages.users.cancel}
        onConfirm={page.confirmUpdate}
        onCancel={() =>
          page.setUpdateConfirmation({
            user: null,
            formData: null,
            isOpen: false,
          })
        }
        isLoading={page.isLoading}
      />

      <UserConfirmationDialog
        user={page.deleteConfirmation.user}
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
      />
    </div>
  );
}

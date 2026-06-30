'use client';

import { PageHeader } from '@/components/layout';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import {
  UserConfirmationDialog,
  UserManagementSheet,
  UserManagementTable,
} from '@/components/users';
import { FeatureGuard } from '@/components/features/feature-guard';
import { useI18n } from '@/i18n';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useTenantUsersPage } from '@/lib/hooks/use-tenant-users-page';
import * as React from 'react';

export default function TenantUsersPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
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

        <UserManagementSheet
          open={page.isSheetOpen}
          onOpenChange={page.setIsSheetOpen}
          editingUser={page.editingUser}
          allowedRoles={page.allowedRoles}
          hideTenantSelection={true}
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
          description={t.pages.users.confirmDeleteTenantDescription}
          confirmLabel={t.pages.users.delete}
          cancelLabel={t.pages.users.cancel}
          variant="destructive"
          onConfirm={page.confirmDelete}
          onCancel={() =>
            page.setDeleteConfirmation({ user: null, isOpen: false })
          }
        />
      </div>
    </FeatureGuard>
  );
}

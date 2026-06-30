'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  UserManagementForm,
  type UserManagementFormRef,
} from './user-management-form';
import type { UserFormData } from './user-form-types';
import type { User, Tenant, UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';

interface UserManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: User | null;
  tenants?: Tenant[];
  isVGreensAdmin?: boolean;
  allowedRoles?: UserRole[];
  hideTenantSelection?: boolean;
  isLoading: boolean;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

/**
 * Sheet (slide-over) that hosts the user create/edit form. Extracted from the
 * admin and tenant user pages so each page-level file stays under the 150-line
 * component cap and the open/close + footer-button wiring lives in one place.
 */
export function UserManagementSheet({
  open,
  onOpenChange,
  editingUser,
  tenants,
  isVGreensAdmin,
  allowedRoles,
  hideTenantSelection,
  isLoading,
  onSubmit,
  onCancel,
}: UserManagementSheetProps) {
  const { t } = useI18n();
  const formRef = React.useRef<UserManagementFormRef>(null);
  const usersT = t.pages.admin.users;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
          <SheetTitle className="dark:text-card-foreground">
            {editingUser ? usersT.editUser : usersT.createUser}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <UserManagementForm
            ref={formRef}
            initialData={editingUser || undefined}
            tenants={tenants}
            isVGreensAdmin={isVGreensAdmin}
            allowedRoles={allowedRoles}
            hideTenantSelection={hideTenantSelection}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </div>
        <SheetFooter className="dark:border-primary-foreground/30 flex-row gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 flex-1"
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
              : editingUser
                ? usersT.updateUser
                : usersT.createUser}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

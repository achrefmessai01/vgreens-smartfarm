'use client';

import * as React from 'react';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  UserRole,
  UserStatus,
  type User,
} from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { extractErrorMessage } from '@/lib/extract-error-message';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import type { UserFormData } from '@/components/users';

export function useTenantUsersPage() {
  const {
    user: currentUser,
    isVGreensInternal,
    isTenantAdmin,
  } = useCurrentUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const errorTitle = t.errors.defaultTitle;
  // Honour the VGREENS_ADMIN tenant picker. For regular tenant admins this is
  // always undefined and we fall back to their own tenant id below. The
  // read-only VGREENS_MEMBER sibling shares the same picker, so we treat
  // both internal roles the same for read access here.
  const selectedTenantId = useTenantIdVariable();
  const tenantId = selectedTenantId ?? currentUser?.tenantId;

  // The `users` query is restricted to admins + internal read-only members;
  // skip it for tenant users to avoid a guaranteed permission error. Pass the
  // selected tenant id so the backend scopes the result to the tenant the
  // admin picked in the navbar.
  const { data, loading, refetch } = useUsersQuery({
    variables: { tenantId: selectedTenantId },
    skip: !(isVGreensInternal || isTenantAdmin),
  });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    user: User | null;
    isOpen: boolean;
  }>({ user: null, isOpen: false });
  // Pending update payload buffered while the tenant admin confirms the
  // change. Mirrors the admin page so the "are you sure?" gate behaves the
  // same on both surfaces.
  const [updateConfirmation, setUpdateConfirmation] = React.useState<{
    user: User | null;
    formData: UserFormData | null;
    isOpen: boolean;
  }>({ user: null, formData: null, isOpen: false });

  const users = React.useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      // Never show internal vGreens accounts (admin or its read-only member
      // sibling) in tenant-scoped lists — they live outside any tenant.
      if (
        u.role === UserRole.VgreensAdmin ||
        u.role === UserRole.VgreensMember
      ) {
        return false;
      }
      // When we have a resolved tenantId (either the admin's picked tenant
      // or the current tenant admin's own tenant) we scope to that tenant.
      // If tenantId is undefined — e.g. an admin in "All tenants" mode —
      // we leave the list untouched so they can see results across tenants.
      if (tenantId && u.tenantId !== tenantId) return false;
      return true;
    }) as User[];
  }, [data?.users, tenantId]);

  const handleCreate = React.useCallback(() => {
    setEditingUser(null);
    setIsSheetOpen(true);
  }, []);

  const handleEdit = React.useCallback((user: User) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  }, []);

  const handleDelete = React.useCallback((user: User) => {
    setDeleteConfirmation({ user, isOpen: true });
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsSheetOpen(false);
    setEditingUser(null);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deleteConfirmation.user) return;
    setIsLoading(true);
    try {
      await deleteUser({ variables: { id: deleteConfirmation.user.id } });
      await refetch();
      setDeleteConfirmation({ user: null, isOpen: false });
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmation.user, deleteUser, refetch]);

  const performUpdate = React.useCallback(
    async (user: User, formData: UserFormData) => {
      setIsLoading(true);
      try {
        const result = await updateUser({
          variables: { id: user.id, input: formData },
        });
        // Apollo surfaces GraphQL errors in `result.errors` instead of
        // rejecting — turn that into a throw so the catch toasts uniformly.
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }
        await refetch();
        setIsSheetOpen(false);
        setEditingUser(null);
        setUpdateConfirmation({ user: null, formData: null, isOpen: false });
      } catch (error) {
        console.error('Error saving user:', error);
        toast({
          title: errorTitle,
          description: extractErrorMessage(error),
          variant: 'destructive',
        });
        // Close the confirmation dialog; keep the sheet open with the user's
        // edits so they can correct and retry.
        setUpdateConfirmation({ user: null, formData: null, isOpen: false });
      } finally {
        setIsLoading(false);
      }
    },
    [refetch, updateUser, toast, errorTitle],
  );

  const handleSubmit = React.useCallback(
    async (formData: UserFormData) => {
      // Edits open the confirmation dialog first; creates go straight through.
      if (editingUser) {
        setUpdateConfirmation({
          user: editingUser,
          formData,
          isOpen: true,
        });
        return;
      }
      setIsLoading(true);
      try {
        const result = await createUser({
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              imageUrl: formData.imageUrl,
              role: formData.role,
              tenantId,
            },
          },
        });
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }
        if (result.data?.createUser?.status === UserStatus.Pending) {
          console.log('User created with pending invitation');
        }
        await refetch();
        setIsSheetOpen(false);
        setEditingUser(null);
      } catch (error) {
        console.error('Error saving user:', error);
        // Toast the backend message AND re-throw so the form can also highlight
        // the offending field (mirrors the admin hook).
        toast({
          title: errorTitle,
          description: extractErrorMessage(error),
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [editingUser, createUser, refetch, tenantId, toast, errorTitle],
  );

  const confirmUpdate = React.useCallback(async () => {
    const { user, formData } = updateConfirmation;
    if (!user || !formData) return;
    await performUpdate(user, formData);
  }, [updateConfirmation, performUpdate]);

  return {
    users,
    loading,
    isLoading,
    editingUser,
    isSheetOpen,
    setIsSheetOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    updateConfirmation,
    setUpdateConfirmation,
    allowedRoles: [UserRole.TenantUser, UserRole.TenantAdmin] as UserRole[],
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    confirmDelete,
    confirmUpdate,
  };
}

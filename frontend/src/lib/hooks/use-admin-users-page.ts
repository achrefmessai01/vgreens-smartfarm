'use client';

import * as React from 'react';
import {
  useUsersQuery,
  useTenantsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  UserRole,
  UserStatus,
  type User,
  type Tenant,
} from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { extractErrorMessage } from '@/lib/extract-error-message';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import type { UserFormData } from '@/components/users/user-management-form';

export function useAdminUsersPage() {
  const { role: currentUserRole } = useCurrentUser();
  const isVGreensAdmin = currentUserRole === UserRole.VgreensAdmin;
  const { toast } = useToast();
  const { t } = useI18n();
  const errorTitle = t.errors.defaultTitle;

  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useUsersQuery();
  const { data: tenantsData, loading: tenantsLoading } = useTenantsQuery({
    skip: !isVGreensAdmin,
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
  // Pending update payload buffered while the admin confirms the change. We
  // hold the form data here instead of writing it back to `editingUser` so
  // the sheet still shows the in-progress edits if they cancel out.
  const [updateConfirmation, setUpdateConfirmation] = React.useState<{
    user: User | null;
    formData: UserFormData | null;
    isOpen: boolean;
  }>({ user: null, formData: null, isOpen: false });

  const users = (usersData?.users || []) as User[];
  const tenants = (tenantsData?.tenants || []) as Tenant[];

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
      await refetchUsers();
      setDeleteConfirmation({ user: null, isOpen: false });
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmation.user, deleteUser, refetchUsers]);

  const performUpdate = React.useCallback(
    async (user: User, formData: UserFormData) => {
      setIsLoading(true);
      try {
        const result = await updateUser({
          variables: { id: user.id, input: formData },
        });
        // The Apollo client returns GraphQL errors in `errors` instead of
        // rejecting, so surface them explicitly (keeps the form open).
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }
        await refetchUsers();
        setIsSheetOpen(false);
        setEditingUser(null);
        setUpdateConfirmation({ user: null, formData: null, isOpen: false });
      } catch (error) {
        console.error('Error saving user:', error);
        // Surface the backend message as a toast — previously we re-threw which
        // bubbled up as an unhandled rejection (Next.js dev overlay). Close the
        // confirmation dialog so the admin can adjust the form and retry; the
        // sheet itself stays open with their in-progress edits intact.
        toast({
          title: errorTitle,
          description: extractErrorMessage(error),
          variant: 'destructive',
        });
        setUpdateConfirmation({ user: null, formData: null, isOpen: false });
      } finally {
        setIsLoading(false);
      }
    },
    [refetchUsers, updateUser, toast, errorTitle],
  );

  const handleSubmit = React.useCallback(
    async (formData: UserFormData) => {
      // Edits are gated behind a confirmation dialog so the admin sees a clear
      // "are you sure?" before any user record is mutated. Creates skip the
      // gate — there's nothing to overwrite yet.
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
              tenantId: formData.tenantId,
            },
          },
        });
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }
        if (result.data?.createUser?.status === UserStatus.Pending) {
          console.log('User created with pending invitation');
        }
        await refetchUsers();
        setIsSheetOpen(false);
        setEditingUser(null);
      } catch (error) {
        console.error('Error saving user:', error);
        // Toast the backend message AND re-throw so the form can also highlight
        // the offending field (e.g. red border on email for the admin
        // email-domain rule). The two surfaces are complementary, not duplicate.
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
    [editingUser, createUser, refetchUsers, toast, errorTitle],
  );

  const confirmUpdate = React.useCallback(async () => {
    const { user, formData } = updateConfirmation;
    if (!user || !formData) return;
    await performUpdate(user, formData);
  }, [updateConfirmation, performUpdate]);

  return {
    users,
    tenants,
    loading: usersLoading || tenantsLoading,
    isLoading,
    isVGreensAdmin,
    editingUser,
    isSheetOpen,
    setIsSheetOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    updateConfirmation,
    setUpdateConfirmation,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    confirmDelete,
    confirmUpdate,
  };
}

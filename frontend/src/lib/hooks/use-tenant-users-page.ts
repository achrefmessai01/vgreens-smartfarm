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
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import type { UserFormData } from '@/components/users';

export function useTenantUsersPage() {
  const { user: currentUser, isVGreensAdmin, isTenantAdmin } = useCurrentUser();
  const tenantId = currentUser?.tenantId;

  // The `users` query is restricted to admins; skip it for tenant users to
  // avoid a guaranteed permission error.
  const { data, loading, refetch } = useUsersQuery({
    skip: !(isVGreensAdmin || isTenantAdmin),
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

  const users = React.useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter(
      (u) => u.tenantId === tenantId && u.role !== UserRole.VgreensAdmin,
    ) as User[];
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

  const handleSubmit = React.useCallback(
    async (formData: UserFormData) => {
      setIsLoading(true);
      try {
        if (editingUser) {
          await updateUser({
            variables: { id: editingUser.id, input: formData },
          });
        } else {
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
          if (result.data?.createUser?.status === UserStatus.Pending) {
            console.log('User created with pending invitation');
          }
        }
        await refetch();
        setIsSheetOpen(false);
        setEditingUser(null);
      } catch (error) {
        console.error('Error saving user:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingUser, createUser, updateUser, refetch, tenantId],
  );

  return {
    users,
    loading,
    isLoading,
    editingUser,
    isSheetOpen,
    setIsSheetOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    allowedRoles: [UserRole.TenantUser, UserRole.TenantAdmin] as UserRole[],
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    confirmDelete,
  };
}

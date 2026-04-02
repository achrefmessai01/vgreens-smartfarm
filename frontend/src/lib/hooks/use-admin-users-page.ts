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
import type { UserFormData } from '@/components/users/user-management-form';

export function useAdminUsersPage() {
  const { role: currentUserRole } = useCurrentUser();
  const isVGreensAdmin = currentUserRole === UserRole.VgreensAdmin;

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
                tenantId: formData.tenantId,
              },
            },
          });
          if (result.data?.createUser?.status === UserStatus.Pending) {
            console.log('User created with pending invitation');
          }
        }
        await refetchUsers();
        setIsSheetOpen(false);
        setEditingUser(null);
      } catch (error) {
        console.error('Error saving user:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingUser, createUser, updateUser, refetchUsers],
  );

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
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    confirmDelete,
  };
}

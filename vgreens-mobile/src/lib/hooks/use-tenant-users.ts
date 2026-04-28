import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from '@/generated/graphql';
import { useCurrentUser } from './use-current-user';
import { toGqlUserRole } from '@/lib/user-role-mapper';
import type { User, UserFormData } from '@/types/user';
import { TENANT_ALLOWED_ROLES } from '@/types/user';

export function useTenantUsers() {
  const { user: currentUser } = useCurrentUser();
  const tenantId = currentUser?.tenantId;

  const { data, loading, refetch } = useUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const users = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter(
      (u) => u.tenantId === tenantId && u.role !== 'VGREENS_ADMIN',
    );
  }, [data?.users, tenantId]);

  const handleCreate = useCallback(
    async (formData: UserFormData) => {
      setIsSubmitting(true);
      try {
        await createUser({
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              imageUrl: formData.imageUrl,
              role: toGqlUserRole(formData.role),
              tenantId,
            },
          },
        });
        await refetch();
        return true;
      } catch (error) {
        console.error('Error creating user:', error);
        Alert.alert('Error', 'Failed to create user. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createUser, refetch, tenantId],
  );

  const handleUpdate = useCallback(
    async (userId: string, formData: UserFormData) => {
      setIsSubmitting(true);
      try {
        await updateUser({
          variables: {
            id: userId,
            input: {
              ...formData,
              role: toGqlUserRole(formData.role),
            },
          },
        });
        await refetch();
        return true;
      } catch (error) {
        console.error('Error updating user:', error);
        Alert.alert('Error', 'Failed to update user. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateUser, refetch],
  );

  const handleDelete = useCallback(
    (user: User) => {
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
      const confirm = async () => {
        setIsSubmitting(true);
        try {
          await deleteUser({ variables: { id: user.id } });
          await refetch();
        } catch (error) {
          console.error('Error deleting user:', error);
          Alert.alert('Error', 'Failed to delete user. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };
      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirm },
        ],
      );
    },
    [deleteUser, refetch],
  );

  const handleToggleActive = useCallback(
    async (user: User) => {
      setIsSubmitting(true);
      try {
        await updateUser({
          variables: {
            id: user.id,
            input: { isActive: !user.isActive },
          },
        });
        await refetch();
      } catch (error) {
        console.error('Error toggling user active state:', error);
        Alert.alert('Error', 'Failed to update user. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateUser, refetch],
  );

  return {
    users,
    loading,
    isSubmitting,
    allowedRoles: TENANT_ALLOWED_ROLES,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    refetch,
  };
}

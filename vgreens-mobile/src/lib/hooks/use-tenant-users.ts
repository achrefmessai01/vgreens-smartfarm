import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { USERS_QUERY } from '@/graphql/queries/user.queries';
import {
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from '@/graphql/mutations/user.mutations';
import { useCurrentUser } from './use-current-user';
import type { User, UserFormData } from '@/types/user';
import { TENANT_ALLOWED_ROLES } from '@/types/user';

interface UsersQueryData {
  users: User[];
}

export function useTenantUsers() {
  const { user: currentUser } = useCurrentUser();
  const tenantId = currentUser?.tenantId;

  const { data, loading, refetch } = useQuery<UsersQueryData>(USERS_QUERY);
  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

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
              role: formData.role,
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
          variables: { id: userId, input: formData },
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
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.email;

      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsSubmitting(true);
              try {
                await deleteUser({ variables: { id: user.id } });
                await refetch();
              } catch (error) {
                console.error('Error deleting user:', error);
                Alert.alert(
                  'Error',
                  'Failed to delete user. Please try again.',
                );
              } finally {
                setIsSubmitting(false);
              }
            },
          },
        ],
      );
    },
    [deleteUser, refetch],
  );

  return {
    users,
    loading,
    isSubmitting,
    allowedRoles: TENANT_ALLOWED_ROLES,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch,
  };
}

import { useLayoutEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { UserFormFields } from '@/components/users/user-form-fields';
import { UserRole as GqlUserRole, useUsersQuery } from '@/generated/graphql';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import type { User, UserRole, UserFormData, UserFormErrors } from '@/types/user';

export default function UserFormScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ userId?: string }>();
  const isEdit = !!params.userId;

  const { handleCreate, handleUpdate, isSubmitting } = useTenantUsers();

  const { data: usersData } = useUsersQuery();
  const editingUser = useMemo(
    () => usersData?.users?.find((u) => u.id === params.userId) ?? null,
    [usersData, params.userId],
  );

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [initialized, setInitialized] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: isEdit ? 'Edit User' : 'New User',
      headerBackTitle: 'Users',
    });
  }, [navigation, isEdit]);

  if (isEdit && editingUser && !initialized) {
    setEmail(editingUser.email || '');
    setFirstName(editingUser.firstName || '');
    setLastName(editingUser.lastName || '');
    setRole(
      editingUser.role === GqlUserRole.TenantAdmin
        ? 'TENANT_ADMIN'
        : editingUser.role === GqlUserRole.TenantUser
          ? 'TENANT_USER'
          : 'VGREENS_ADMIN',
    );
    setIsActive(editingUser.isActive ?? true);
    setInitialized(true);
  }

  const validate = useCallback((): boolean => {
    const newErrors: UserFormErrors = {};
    if (!isEdit && !email.trim()) newErrors.email = 'Email is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email address';
    if (!role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, role, isEdit]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const formData: UserFormData = {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role,
      isActive,
    };

    const success = isEdit && params.userId
      ? await handleUpdate(params.userId, formData)
      : await handleCreate(formData);

    if (success) router.back();
  }, [
    validate, email, firstName, lastName, role, isActive,
    isEdit, params.userId, handleCreate, handleUpdate, router,
  ]);

  if (isEdit && !editingUser) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#016f7c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="px-5 py-6 gap-7"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <UserFormFields
            email={email} setEmail={setEmail}
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            role={role} setRole={setRole}
            isActive={isActive} setIsActive={setIsActive}
            errors={errors} setErrors={setErrors}
            isEdit={isEdit} isSubmitting={isSubmitting}
          />
        </ScrollView>

        <View className="flex-row gap-3 border-t border-border px-5 py-4">
          <Button
            variant="outline"
            label="Cancel"
            onPress={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl"
          />
          <Button
            label={isSubmitting ? undefined : isEdit ? 'Save Changes' : 'Create User'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-xl"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : null}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

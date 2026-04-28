import { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme-preference';
import { InvitePreviewCard } from '@/components/users/invite-preview-card';
import { UserFormFields } from '@/components/users/user-form-fields';
import { UserFormHeader } from '@/components/users/user-form-header';
import { createUserFormStyles } from '@/components/users/user-form-screen.styles';
import { useUsersQuery } from '@/generated/graphql';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import { useUserFormState } from '@/lib/hooks/use-user-form-state';
import type { UserFormData } from '@/types/user';

export default function UserFormScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ userId?: string }>();
  const isEdit = !!params.userId;
  const styles = useMemo(() => createUserFormStyles(colors), [colors]);

  const { handleCreate, handleUpdate, isSubmitting } = useTenantUsers();
  const { data: usersData } = useUsersQuery();
  const editingUser = useMemo(
    () => usersData?.users?.find((u) => u.id === params.userId) ?? null,
    [usersData, params.userId],
  );

  const f = useUserFormState(isEdit, editingUser);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    if (!f.validate()) return;
    const form: UserFormData = {
      email: f.email,
      firstName: f.firstName || undefined,
      lastName: f.lastName || undefined,
      role: f.role,
      isActive: f.isActive,
    };
    const ok = isEdit && params.userId
      ? await handleUpdate(params.userId, form)
      : await handleCreate(form);
    if (ok) router.back();
  }, [f, isEdit, params.userId, handleCreate, handleUpdate, router]);

  if (isEdit && !editingUser) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const title = isEdit ? 'Edit User' : 'Invite User';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kb}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <UserFormHeader title={title} onBack={() => router.back()} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {!isEdit ? (
            <InvitePreviewCard
              name={[f.firstName, f.lastName].filter(Boolean).join(' ')}
              email={f.email}
            />
          ) : null}
          <UserFormFields
            email={f.email}
            setEmail={f.setEmail}
            firstName={f.firstName}
            setFirstName={f.setFirstName}
            lastName={f.lastName}
            setLastName={f.setLastName}
            role={f.role}
            setRole={f.setRole}
            isActive={f.isActive}
            setIsActive={f.setIsActive}
            errors={f.errors}
            clearError={f.clearError}
            isEdit={isEdit}
            isSubmitting={isSubmitting}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.back()}
            disabled={isSubmitting}
            style={[styles.btn, styles.btnOutline, isSubmitting && styles.btnDisabled]}
          >
            <Text style={styles.btnOutlineText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            style={[styles.btn, styles.btnPrimary, isSubmitting && styles.btnDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.btnPrimaryText}>
                {isEdit ? 'Save changes' : 'Create user'}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

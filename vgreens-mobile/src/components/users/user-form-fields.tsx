import { memo, useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { HarvestBatchField } from '@/components/harvest/harvest-batch-field';
import { HarvestFormSection } from '@/components/harvest/harvest-form-section';
import { useAppTheme } from '@/lib/theme-preference';
import { RolePicker } from './role-picker';
import { createUserFormFieldsStyles } from './user-form-fields.styles';
import {
  TENANT_ALLOWED_ROLES,
  type UserFormErrors,
  type UserRole,
} from '@/types/user';

interface UserFormFieldsProps {
  email: string;
  setEmail: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  role?: UserRole;
  setRole: (v: UserRole) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  errors: UserFormErrors;
  clearError: (key: keyof UserFormErrors) => void;
  isEdit: boolean;
  isSubmitting: boolean;
}

function UserFormFieldsBase({
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  role,
  setRole,
  isActive,
  setIsActive,
  errors,
  clearError,
  isEdit,
  isSubmitting,
}: UserFormFieldsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createUserFormFieldsStyles(colors), [colors]);

  const handleEmail = (v: string) => {
    setEmail(v);
    if (errors.email) clearError('email');
  };
  const handleRole = (v: UserRole) => {
    setRole(v);
    if (errors.role) clearError('role');
  };

  return (
    <View style={styles.wrap}>
      <HarvestFormSection
        step={1}
        title="Account"
        description="How they'll sign in to vGreens."
      >
        <HarvestBatchField
          label="Email"
          required
          value={email}
          onChangeText={handleEmail}
          placeholder="user@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          hint={isEdit ? 'Email cannot be changed after creation' : undefined}
          readOnly={isEdit}
        />
      </HarvestFormSection>

      <HarvestFormSection
        step={2}
        title="Personal info"
        description="Optional — shown in the team list."
      >
        <HarvestBatchField
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
        />
        <HarvestBatchField
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
        />
      </HarvestFormSection>

      <HarvestFormSection
        step={3}
        title="Permissions"
        description="Role controls what the user can see and change."
      >
        <RolePicker
          value={role}
          onChange={handleRole}
          allowedRoles={TENANT_ALLOWED_ROLES}
          disabled={isSubmitting}
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Active</Text>
            <Text style={styles.toggleHint}>
              Inactive users cannot sign in to the app.
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={isSubmitting}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </HarvestFormSection>
    </View>
  );
}

export const UserFormFields = memo(UserFormFieldsBase);
UserFormFields.displayName = 'UserFormFields';

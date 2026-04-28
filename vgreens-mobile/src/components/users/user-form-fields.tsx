import { memo, useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { HarvestBatchField } from '@/components/harvest/harvest-batch-field';
import { useAppTheme } from '@/lib/theme-preference';
import { RoleCard } from './role-card';
import { UserFormGroup } from './user-form-group';
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

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  TENANT_ADMIN: 'Full access — manage users, farms, data, and settings.',
  TENANT_USER: 'Standard access — view and record farm data, no admin tools.',
  VGREENS_ADMIN: 'Platform-level access — reserved for vGreens staff.',
};

function UserFormFieldsBase({
  email, setEmail, firstName, setFirstName, lastName, setLastName,
  role, setRole, isActive, setIsActive, errors, clearError,
  isEdit, isSubmitting,
}: UserFormFieldsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createUserFormFieldsStyles(colors), [colors]);

  const onEmailChange = (v: string) => {
    setEmail(v);
    if (errors.email) clearError('email');
  };
  const onRoleChange = (v: UserRole) => {
    setRole(v);
    if (errors.role) clearError('role');
  };

  return (
    <View style={styles.wrap}>
      <UserFormGroup label="Account">
        <HarvestBatchField
          label="Email"
          required
          value={email}
          onChangeText={onEmailChange}
          placeholder="user@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          hint={isEdit ? 'Email cannot be changed after creation' : undefined}
          readOnly={isEdit}
        />
      </UserFormGroup>

      <UserFormGroup label="Profile">
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
      </UserFormGroup>

      <UserFormGroup label="Role & access">
        {TENANT_ALLOWED_ROLES.map((r) => (
          <RoleCard
            key={r}
            role={r}
            description={ROLE_DESCRIPTIONS[r]}
            selected={role === r}
            disabled={isSubmitting}
            onSelect={onRoleChange}
          />
        ))}

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
      </UserFormGroup>
    </View>
  );
}

export const UserFormFields = memo(UserFormFieldsBase);
UserFormFields.displayName = 'UserFormFields';

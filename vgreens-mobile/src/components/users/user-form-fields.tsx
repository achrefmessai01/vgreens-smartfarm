import { View, Text } from 'react-native';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RolePicker } from './role-picker';
import type { UserRole, UserFormErrors } from '@/types/user';
import { TENANT_ALLOWED_ROLES } from '@/types/user';

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
  setErrors: React.Dispatch<React.SetStateAction<UserFormErrors>>;
  isEdit: boolean;
  isSubmitting: boolean;
}

export function UserFormFields({
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
  setErrors,
  isEdit,
  isSubmitting,
}: UserFormFieldsProps) {
  return (
    <>
      <FormField label="Email" error={errors.email}>
        <Input
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder="user@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!isEdit}
          className={isEdit ? 'opacity-50' : ''}
        />
      </FormField>

      <FormField label="First Name">
        <Input
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          textContentType="givenName"
        />
      </FormField>

      <FormField label="Last Name">
        <Input
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          textContentType="familyName"
        />
      </FormField>

      <FormField label="Role *" error={errors.role}>
        <RolePicker
          value={role}
          onChange={(v) => {
            setRole(v);
            if (errors.role) setErrors((e) => ({ ...e, role: undefined }));
          }}
          allowedRoles={TENANT_ALLOWED_ROLES}
          disabled={isSubmitting}
        />
      </FormField>

      <View className="flex-row items-center justify-between rounded-lg border border-border px-4 py-3">
        <Text className="text-sm font-medium text-foreground">Active</Text>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isSubmitting}
        />
      </View>
    </>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {children}
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
    </View>
  );
}

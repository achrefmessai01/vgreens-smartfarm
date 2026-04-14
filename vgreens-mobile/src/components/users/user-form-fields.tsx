import { View, Text } from 'react-native';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, type SelectOption } from '@/components/ui/select';
import { FormSection, FormField } from '@/components/ui/form-helpers';
import type { UserRole, UserFormErrors } from '@/types/user';
import { ROLE_LABELS, TENANT_ALLOWED_ROLES } from '@/types/user';

const ROLE_OPTIONS: SelectOption[] = TENANT_ALLOWED_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

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
      <FormSection title="Account">
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
            className={`rounded-xl bg-card ${isEdit ? 'opacity-50' : ''}`}
          />
          {isEdit ? (
            <Text className="text-xs text-muted-foreground">
              Email cannot be changed after creation
            </Text>
          ) : null}
        </FormField>
      </FormSection>

      <FormSection title="Personal Info">
        <FormField label="First Name">
          <Input
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            textContentType="givenName"
            className="rounded-xl bg-card"
          />
        </FormField>

        <FormField label="Last Name">
          <Input
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            textContentType="familyName"
            className="rounded-xl bg-card"
          />
        </FormField>
      </FormSection>

      <FormSection title="Permissions">
        <FormField label="Role" error={errors.role}>
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v as UserRole);
              if (errors.role) setErrors((e) => ({ ...e, role: undefined }));
            }}
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
            disabled={isSubmitting}
            hasError={!!errors.role}
          />
        </FormField>

        <View className="flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3.5">
          <View>
            <Text className="text-[15px] font-medium text-foreground">
              Active
            </Text>
            <Text className="text-xs text-muted-foreground">
              Inactive users cannot sign in
            </Text>
          </View>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isSubmitting}
          />
        </View>
      </FormSection>
    </>
  );
}

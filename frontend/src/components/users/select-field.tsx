'use client';

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserFormErrors } from './user-form-types';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  errors?: UserFormErrors;
  errorKey?: keyof UserFormErrors;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  errors,
  errorKey,
  isLoading = false,
  disabled = false,
  required = false,
}: SelectFieldProps) {
  const error = errorKey && errors ? errors[errorKey] : undefined;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <FieldContent>
        <Select
          value={value || ''}
          onValueChange={onChange}
          disabled={isLoading || disabled}
        >
          <SelectTrigger aria-invalid={!!error} id={id}>
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  );
}

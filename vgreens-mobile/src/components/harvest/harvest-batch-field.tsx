import { memo, useMemo, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
} from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { createBatchFormStyles } from './harvest-batch-form.styles';

interface HarvestBatchFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  error?: string;
  hint?: string;
  suffix?: string;
  readOnly?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

function HarvestBatchFieldBase({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  returnKeyType = 'next',
  error,
  hint,
  suffix,
  readOnly,
  autoCapitalize = 'sentences',
}: HarvestBatchFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchFormStyles(colors), [colors]);
  const editable = !readOnly && !!onChangeText;
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View
        style={[
          styles.inputRow,
          focused && !error && styles.inputFocused,
          error ? styles.inputErr : null,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          editable={editable}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export const HarvestBatchField = memo(HarvestBatchFieldBase);
HarvestBatchField.displayName = 'HarvestBatchField';

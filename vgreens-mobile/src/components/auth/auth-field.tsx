import { memo, useMemo, useState, type ComponentType } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { createAuthFieldStyles } from './auth-field.styles';

interface AuthFieldProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: 'email' | 'password' | 'one-time-code' | 'off';
  textContentType?: TextInputProps['textContentType'];
}

function AuthFieldBase({
  Icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoComplete,
  textContentType,
}: AuthFieldProps) {
  const { colors } = useAppTheme();
  const [reveal, setReveal] = useState(false);
  const [focused, setFocused] = useState(false);

  const floated = focused || value.length > 0;
  const progress = useSharedValue(floated ? 1 : 0);
  const styles = useMemo(() => createAuthFieldStyles(colors, focused), [colors, focused]);

  const handleFocus = () => {
    setFocused(true);
    progress.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value.length) progress.value = withTiming(0, { duration: 160, easing: Easing.out(Easing.cubic) });
  };

  // Small label slides down from above and fades in when floated
  const smallLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.2, 1], [0, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [-4, 0]) }],
  }));

  const hidden = secureTextEntry && !reveal;

  return (
    <View style={styles.row}>
      <Icon size={16} color={focused ? colors.primary : colors.mutedForeground} />
      <View style={styles.inputWrap}>
        {/* Small floating label at top — only visible when floated */}
        <Animated.View style={[styles.smallLabelWrap, smallLabelStyle]} pointerEvents="none">
          <Text style={[styles.smallLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
            {placeholder}
          </Text>
        </Animated.View>
        {/*
          Native placeholder handles the not-floated state.
          paddingTop: 20 shifts typed text below the small label when floated.
          placeholderTextColor transparent when floated prevents the native
          placeholder showing behind the small floating label.
        */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, floated && styles.inputFloated]}
          placeholder={placeholder}
          placeholderTextColor={floated ? 'transparent' : colors.mutedForeground}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {secureTextEntry ? (
        <Pressable
          onPress={() => setReveal((v) => !v)}
          style={styles.toggle}
          hitSlop={8}
          accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
        >
          {reveal ? (
            <EyeOff size={16} color={colors.mutedForeground} />
          ) : (
            <Eye size={16} color={colors.mutedForeground} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export function AuthFieldLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.foreground, marginBottom: 6 }}>
      {children}
    </Text>
  );
}

export const AuthField = memo(AuthFieldBase);
AuthField.displayName = 'AuthField';

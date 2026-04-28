import { memo, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface UserFormGroupProps {
  label: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
}

function UserFormGroupBase({
  label,
  description,
  right,
  children,
}: UserFormGroupProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 10 },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        },
        label: {
          fontSize: 11,
          fontWeight: '800',
          color: colors.mutedForeground,
          letterSpacing: 0.8,
        },
        description: {
          fontSize: 12,
          color: colors.mutedForeground,
          lineHeight: 17,
        },
        body: { gap: 12 },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {right}
      </View>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export const UserFormGroup = memo(UserFormGroupBase);
UserFormGroup.displayName = 'UserFormGroup';

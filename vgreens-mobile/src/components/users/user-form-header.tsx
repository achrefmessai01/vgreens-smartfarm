import { memo, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface UserFormHeaderProps {
  title: string;
  onBack: () => void;
}

function UserFormHeaderBase({ title, onBack }: UserFormHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { backgroundColor: colors.background },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 14,
        },
        backBtn: {
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.muted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        title: {
          flex: 1,
          fontSize: 20,
          fontWeight: '800',
          color: colors.foreground,
          letterSpacing: -0.3,
        },
        separator: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.separator} />
    </View>
  );
}

export const UserFormHeader = memo(UserFormHeaderBase);
UserFormHeader.displayName = 'UserFormHeader';

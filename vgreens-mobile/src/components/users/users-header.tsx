import { memo, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface UsersHeaderProps {
  total: number;
  admins: number;
  disabled?: boolean;
  onInvitePress: () => void;
}

function UsersHeaderBase({
  total,
  admins,
  disabled,
  onInvitePress,
}: UsersHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 12,
          gap: 12,
        },
        text: { flex: 1, minWidth: 0 },
        h1: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.foreground,
          letterSpacing: -0.5,
        },
        sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
        cta: {
          flexShrink: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: '#10b981',
        },
        ctaDisabled: { opacity: 0.6 },
        ctaText: { fontSize: 12, fontWeight: '800', color: '#fff' },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.h1} numberOfLines={1}>
          Team
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {total} member{total === 1 ? '' : 's'} · {admins} admin
          {admins === 1 ? '' : 's'}
        </Text>
      </View>
      <Pressable
        onPress={onInvitePress}
        disabled={disabled}
        style={[styles.cta, disabled && styles.ctaDisabled]}
      >
        <Plus size={14} color="#fff" />
        <Text style={styles.ctaText}>Invite</Text>
      </Pressable>
    </View>
  );
}

export const UsersHeader = memo(UsersHeaderBase);
UsersHeader.displayName = 'UsersHeader';

import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User as UserIcon } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface InvitePreviewCardProps {
  name?: string;
  email?: string;
}

function InvitePreviewCardBase({ name, email }: InvitePreviewCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}10`,
        },
        iconChip: {
          width: 44,
          height: 44,
          borderRadius: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
        },
        body: { flex: 1, minWidth: 0 },
        eyebrow: {
          fontSize: 10,
          fontWeight: '800',
          color: colors.primary,
          letterSpacing: 0.8,
        },
        name: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.foreground,
          marginTop: 2,
        },
        email: {
          fontSize: 12,
          color: colors.mutedForeground,
          marginTop: 2,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.iconChip}>
        <UserIcon size={20} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>PREVIEW</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name?.trim() || 'New team member'}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {email?.trim() || 'email@example.com'}
        </Text>
      </View>
    </View>
  );
}

export const InvitePreviewCard = memo(InvitePreviewCardBase);
InvitePreviewCard.displayName = 'InvitePreviewCard';

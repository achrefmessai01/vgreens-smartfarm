import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createHeroStyles(colors: SemanticColors, accent: string) {
  return StyleSheet.create({
    card: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatarWrap: { position: 'relative', width: 56, height: 56 },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 20,
      backgroundColor: accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      fontSize: 18,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.3,
    },
    verifiedDot: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#10b981',
      borderWidth: 2,
      borderColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1, minWidth: 0, gap: 4 },
    name: { fontSize: 17, fontWeight: '800', color: colors.foreground },
    meta: { fontSize: 13, color: colors.mutedForeground },
    emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    emailText: { fontSize: 12, color: colors.mutedForeground },
  });
}

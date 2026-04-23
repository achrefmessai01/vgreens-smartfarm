import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createUserCardStyles(colors: SemanticColors, accent: string) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      marginHorizontal: 1,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    info: { flex: 1, minWidth: 0, gap: 4 },
    name: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    email: { fontSize: 12, color: colors.mutedForeground },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    rolePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: `${accent}1f`,
    },
    rolePillText: {
      fontSize: 10,
      fontWeight: '800',
      color: accent,
      letterSpacing: 0.3,
    },
    time: { fontSize: 11, color: colors.mutedForeground },
    menuBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inactiveTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: 'rgba(107,114,128,0.16)',
    },
    inactiveText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#6b7280',
      letterSpacing: 0.4,
    },
  });
}

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createUserCardStyles(colors: SemanticColors, accent: string) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 14,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      marginHorizontal: 1,
    },
    card: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 12,
    },
    topRow: { flexDirection: 'row', gap: 12 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      fontSize: 14,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.3,
    },
    info: { flex: 1, minWidth: 0, gap: 2 },
    name: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    email: { fontSize: 12, color: colors.mutedForeground },
    pillsCol: { alignItems: 'flex-end', gap: 6 },
    rolePill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: `${accent}1f`,
    },
    rolePillText: { fontSize: 10, fontWeight: '800', color: accent },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    statusPillText: { fontSize: 10, fontWeight: '800' },
    actions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: 10,
    },
    btnEdit: {
      backgroundColor: colors.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    btnEditText: { fontSize: 13, fontWeight: '600', color: colors.foreground },
    btnDel: { backgroundColor: '#b91c1c' },
    btnDelText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  });
}

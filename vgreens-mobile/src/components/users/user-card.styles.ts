import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export const REVEAL_WIDTH = 176;

export function createUserCardStyles(colors: SemanticColors, accent: string) {
  return StyleSheet.create({
    // Outer shell owns the rounded shape + border + shadow.
    // Both the action strip and the sliding card live inside it.
    outer: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      marginHorizontal: 1,
    },
    actionsStrip: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'stretch',
      paddingRight: 8,
      gap: 8,
      paddingVertical: 8,
    },
    actionBtn: {
      width: (REVEAL_WIDTH - 24) / 2,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionEdit: { backgroundColor: 'rgba(16,185,129,0.22)' },
    actionEditText: { fontSize: 13, fontWeight: '800', color: '#10b981' },
    actionDelete: { backgroundColor: 'rgba(239,68,68,0.22)' },
    actionDeleteText: { fontSize: 13, fontWeight: '800', color: '#ef4444' },
    // Sliding card: flat (no border/radius/shadow) so it moves cleanly under the outer shell.
    cardWrap: { backgroundColor: colors.card },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 12,
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

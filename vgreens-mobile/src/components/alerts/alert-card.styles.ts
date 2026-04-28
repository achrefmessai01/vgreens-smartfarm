import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createAlertCardStyles(
  colors: SemanticColors,
  sev: { color: string; bg: string },
  stat: { color: string; bg: string },
) {
  return StyleSheet.create({
    // Outer wrapper carries the shadow; inner carries the clipped rounded border.
    cardWrap: {
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
      flexDirection: 'row',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    bar: { width: 4, backgroundColor: sev.color },
    body: { flex: 1, padding: 14, gap: 6 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    titleCol: { flex: 1, minWidth: 0 },
    title: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    subtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: stat.bg,
    },
    pillText: { fontSize: 10, fontWeight: '800', color: stat.color },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
      marginTop: 2,
    },
    value: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.foreground,
      fontVariant: ['tabular-nums'],
    },
    measurement: { fontSize: 12, color: colors.mutedForeground },
    description: {
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 17,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
      gap: 8,
    },
    sevChip: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: sev.bg,
    },
    sevText: { fontSize: 10, fontWeight: '700', color: sev.color },
    time: { fontSize: 11, color: colors.mutedForeground },
  });
}

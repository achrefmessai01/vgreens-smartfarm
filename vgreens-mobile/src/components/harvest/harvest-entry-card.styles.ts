import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export const REVEAL_WIDTH = 176;

export function createEntryCardStyles(colors: SemanticColors) {
  return StyleSheet.create({
    outer: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    actionsStrip: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'stretch',
      paddingRight: 6,
      paddingVertical: 6,
      gap: 6,
    },
    actionBtn: {
      width: (REVEAL_WIDTH - 18) / 2,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    actionEdit: { backgroundColor: 'rgba(16,185,129,0.22)' },
    actionEditText: { fontSize: 12, fontWeight: '800', color: '#10b981' },
    actionDelete: { backgroundColor: 'rgba(239,68,68,0.22)' },
    actionDeleteText: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
    cardWrap: { backgroundColor: colors.card },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
      backgroundColor: colors.card,
    },
    leftCol: { flex: 1, minWidth: 0, gap: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    date: { fontSize: 13, fontWeight: '700', color: colors.foreground },
    author: {
      fontSize: 11,
      color: colors.mutedForeground,
      flexShrink: 1,
    },
    rightCol: { alignItems: 'flex-end', gap: 4 },
    numbersRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    num: { fontSize: 16, fontWeight: '800' },
    numGood: { color: '#10b981' },
    numBad: { color: '#ef4444' },
    dot: { fontSize: 16, color: colors.mutedForeground, fontWeight: '700' },
    brixChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    brixText: { fontSize: 11, fontWeight: '700', color: colors.foreground },
    menuBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

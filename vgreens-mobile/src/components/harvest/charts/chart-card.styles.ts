import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createChartCardStyles(colors: SemanticColors, readoutColor?: string) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    titleCol: { flex: 1, minWidth: 0 },
    title: { fontSize: 14, fontWeight: '700', color: colors.foreground },
    subtitle: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    readoutRow: { flexDirection: 'row', alignItems: 'baseline' },
    readout: {
      fontSize: 18,
      fontWeight: '800',
      color: readoutColor ?? colors.foreground,
      fontVariant: ['tabular-nums'],
    },
    unit: { fontSize: 11, color: colors.mutedForeground, marginLeft: 2 },
    legend: { flexDirection: 'row', gap: 12, marginTop: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 2 },
    legendText: { fontSize: 11, color: colors.mutedForeground },
    peakText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: '600',
    },
    empty: {
      fontSize: 13,
      color: colors.mutedForeground,
      paddingVertical: 32,
      textAlign: 'center',
    },
  });
}

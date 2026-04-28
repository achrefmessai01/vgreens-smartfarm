import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createHeroCardStyles(colors: SemanticColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden',
    },
    glowAccent: {
      position: 'absolute',
      top: -40,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#10b981',
      opacity: 0.12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    ringCol: { width: 128, height: 128 },
    statsCol: { flex: 1, minWidth: 0 },
    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10b981',
      letterSpacing: 1,
    },
    value: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.6,
      marginTop: 4,
    },
    unit: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.mutedForeground,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },
    trendText: { fontSize: 11, fontWeight: '700', color: '#10b981' },
    divider: {
      marginTop: 14,
      marginBottom: 10,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    footerItem: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    footerValue: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.foreground,
    },
    footerLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
  });
}

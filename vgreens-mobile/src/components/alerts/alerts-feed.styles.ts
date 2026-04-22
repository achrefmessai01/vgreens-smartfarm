import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createAlertsFeedStyles(colors: SemanticColors) {
  return StyleSheet.create({
    flex: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    headerText: { flex: 1, minWidth: 0 },
    h1: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    openChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(239,68,68,0.14)',
    },
    openText: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
    listContent: { gap: 10, paddingBottom: 24 },
    errorBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    errorText: {
      fontSize: 13,
      color: colors.destructive,
      textAlign: 'center',
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryText: { color: colors.primaryForeground, fontWeight: '700' },
    empty: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 56,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    emptySub: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: 'center',
      maxWidth: 260,
    },
  });
}

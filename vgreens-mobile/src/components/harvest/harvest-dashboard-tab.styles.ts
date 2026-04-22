import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createDashboardTabStyles(colors: SemanticColors) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40, gap: 14 },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 10,
      backgroundColor: colors.background,
    },
    topStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    topLeft: { flex: 1, minWidth: 0 },
    date: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.mutedForeground,
      letterSpacing: 1,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.5,
      marginTop: 2,
    },
    topActions: { flexDirection: 'row', gap: 8 },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    notifDot: {
      position: 'absolute',
      top: 7,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ef4444',
    },
    muted: { fontSize: 14, color: colors.mutedForeground },
    err: { fontSize: 14, color: colors.destructive, textAlign: 'center' },
    retry: {
      marginTop: 4,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    retryText: { color: colors.primaryForeground, fontWeight: '600' },
  });
}

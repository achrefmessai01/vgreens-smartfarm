import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createSettingsStyles(colors: SemanticColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingVertical: 8, paddingBottom: 40, gap: 12 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerLeft: { flex: 1, minWidth: 0 },
    h1: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    helpBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: 'rgba(16,185,129,0.14)',
    },
    verifiedText: { fontSize: 11, fontWeight: '700', color: '#10b981' },
    rightCount: { fontSize: 13, fontWeight: '700', color: colors.foreground },
    rightText: { fontSize: 13, color: colors.mutedForeground },
    signOut: {
      flexDirection: 'row',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 8,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#b91c1c',
      backgroundColor: 'rgba(185,28,28,0.08)',
    },
    signOutText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#b91c1c',
    },
    appName: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 16,
    },
  });
}

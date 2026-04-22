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
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 16,
      backgroundColor: `${colors.primary}10`,
      borderWidth: 1,
      borderColor: `${colors.primary}33`,
    },
    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}24`,
    },
    heroText: { flex: 1 },
    h1: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    muted: { fontSize: 14, color: colors.mutedForeground },
    err: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: 'center',
    },
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

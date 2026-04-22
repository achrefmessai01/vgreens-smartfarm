import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createUsersScreenStyles(colors: SemanticColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 14,
    },
    headText: { flex: 1, minWidth: 0 },
    h1: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    cta: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    ctaText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primaryForeground,
    },
    listContent: { gap: 10, paddingBottom: 24 },
    empty: {
      alignItems: 'center',
      gap: 10,
      paddingTop: 48,
      paddingHorizontal: 24,
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
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

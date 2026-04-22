import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createHarvestHistoryStyles(colors: SemanticColors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.background,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 12,
      gap: 12,
    },
    headText: { flex: 1, minWidth: 0 },
    h1: { fontSize: 22, fontWeight: '800', color: colors.foreground },
    sub: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    createBtn: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#059669',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    createText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    muted: { color: colors.mutedForeground },
    empty: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.foreground,
      marginTop: 12,
    },
    emptySub: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 6,
    },
    createBtn2: {
      marginTop: 16,
      backgroundColor: '#059669',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
  });
}

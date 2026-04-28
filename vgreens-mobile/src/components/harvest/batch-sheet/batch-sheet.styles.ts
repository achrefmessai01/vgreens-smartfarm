import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createBatchSheetStyles(colors: SemanticColors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: colors.foreground,
    },
    close: { padding: 4 },
    summary: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: colors.muted,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 24 },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyText: { color: colors.mutedForeground },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    submit: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitDisabled: { opacity: 0.6 },
    submitText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primaryForeground,
    },
  });
}

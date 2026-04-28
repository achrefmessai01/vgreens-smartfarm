import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createFormModalStyles(colors: SemanticColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    kb: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    titleCol: { flex: 1, minWidth: 0 },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    close: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.muted,
    },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 14 },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    submit: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitDisabled: { opacity: 0.55 },
    submitText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primaryForeground,
      letterSpacing: 0.2,
    },
  });
}

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createUserFormStyles(colors: SemanticColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    kb: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 14 },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    btn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnOutline: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    btnOutlineText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
    },
    btnPrimary: { backgroundColor: colors.primary },
    btnPrimaryText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primaryForeground,
    },
    btnDisabled: { opacity: 0.55 },
  });
}

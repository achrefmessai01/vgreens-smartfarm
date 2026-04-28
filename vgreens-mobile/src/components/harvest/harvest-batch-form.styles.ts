import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createBatchFormStyles(colors: SemanticColors) {
  return StyleSheet.create({
    field: { gap: 6 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.foreground,
      letterSpacing: 0.1,
    },
    required: { color: colors.primary, fontWeight: '700' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.foreground,
    },
    suffix: {
      paddingHorizontal: 14,
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: '600',
    },
    inputFocused: { borderColor: colors.primary },
    inputErr: { borderColor: colors.destructive },
    inputDisabled: { opacity: 0.55 },
    err: { fontSize: 12, color: colors.destructive, marginTop: 2 },
    hint: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  });
}

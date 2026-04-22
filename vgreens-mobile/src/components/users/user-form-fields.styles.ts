import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createUserFormFieldsStyles(colors: SemanticColors) {
  return StyleSheet.create({
    wrap: { gap: 14 },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 12,
    },
    toggleText: { flex: 1, minWidth: 0 },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: colors.foreground },
    toggleHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
  });
}

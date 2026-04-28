import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createAuthFieldStyles(colors: SemanticColors, focused: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 58,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: focused ? colors.primary : colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      gap: 10,
      shadowColor: focused ? colors.primary : '#000',
      shadowOpacity: focused ? 0.1 : 0.03,
      shadowRadius: focused ? 8 : 2,
      shadowOffset: { width: 0, height: 2 },
      elevation: focused ? 3 : 1,
    },
    // Takes remaining row space; holds smallLabel (absolute) + TextInput stacked
    inputWrap: { flex: 1, height: '100%' },
    // Small label floats to the top when field has value or is focused
    smallLabelWrap: { position: 'absolute', top: 8, left: 0 },
    smallLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    // paddingTop pushes typed text below the small label when floated
    input: {
      fontSize: 14.5,
      color: colors.foreground,
      paddingVertical: 0,
      height: '100%',
    },
    inputFloated: { paddingTop: 20 },
    toggle: { padding: 4 },
  });
}

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createAlertDetailStyles(colors: SemanticColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '92%',
      backgroundColor: colors.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: colors.foreground,
    },
    pillRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    pillText: { fontSize: 11, fontWeight: '800' },
    content: { padding: 16, gap: 14 },
    row: { gap: 2 },
    label: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    value: { fontSize: 14, color: colors.foreground, lineHeight: 19 },
    footer: {
      flexDirection: 'row',
      gap: 8,
      padding: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    btn: {
      flex: 1,
      minWidth: 100,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    btnPrimary: { backgroundColor: colors.primary },
    btnPrimaryText: { fontWeight: '700', color: colors.primaryForeground },
    btnOutline: {
      borderWidth: 1,
      borderColor: colors.destructive,
      backgroundColor: 'transparent',
    },
    btnOutlineText: { fontWeight: '700', color: colors.destructive },
  });
}

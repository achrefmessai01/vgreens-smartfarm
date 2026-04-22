import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createBatchGroupStyles(colors: SemanticColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 12,
    },
    header: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 10,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chevronBtn: { padding: 4, marginLeft: -4 },
    title: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnPrimary: { backgroundColor: `${colors.primary}1f` },
    iconBtnMuted: { backgroundColor: colors.muted },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: colors.muted,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.foreground,
      letterSpacing: 0.3,
    },
    metaText: { fontSize: 11, color: colors.mutedForeground },
    body: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      padding: 12,
      gap: 10,
      backgroundColor: colors.background,
    },
    emptyBody: { paddingVertical: 18, alignItems: 'center' },
    emptyText: { fontSize: 13, color: colors.mutedForeground },
    emptyHint: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: 'center',
    },
    actionsRow: { flexDirection: 'row', gap: 6 },
  });
}

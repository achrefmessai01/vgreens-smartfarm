import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export const REVEAL_WIDTH = 176;

export function createBatchGroupStyles(colors: SemanticColors) {
  return StyleSheet.create({
    // Outer shell owns the rounded shape + border + shadow.
    // The header has its own clipping region so the slide-reveal
    // action strip sits behind the header only (never overlaps body).
    outer: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    headerClip: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    actionsStrip: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'stretch',
      paddingRight: 8,
      paddingVertical: 8,
      gap: 8,
    },
    actionBtn: {
      width: (REVEAL_WIDTH - 24) / 2,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionEdit: { backgroundColor: 'rgba(16,185,129,0.22)' },
    actionEditText: { fontSize: 13, fontWeight: '800', color: '#10b981' },
    actionDelete: { backgroundColor: 'rgba(239,68,68,0.22)' },
    actionDeleteText: { fontSize: 13, fontWeight: '800', color: '#ef4444' },
    headerWrap: { backgroundColor: colors.card },
    header: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chevronBtn: { padding: 4, marginLeft: -4 },
    title: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    menuBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    stat: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.mutedForeground,
      letterSpacing: 0.5,
    },
    statValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    barLabel: { fontSize: 11, fontWeight: '700', color: colors.foreground },
    barArea: { fontSize: 11, color: colors.mutedForeground },
    barTrack: {
      marginTop: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.muted,
      overflow: 'hidden',
    },
    barFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
    body: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      padding: 12,
      gap: 10,
      backgroundColor: colors.background,
    },
    bodyHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    bodyHeadText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.mutedForeground,
      letterSpacing: 0.6,
    },
    logBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: `${colors.primary}1f`,
    },
    logBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    emptyBody: { paddingVertical: 18, alignItems: 'center' },
    emptyText: { fontSize: 13, color: colors.mutedForeground },
  });
}

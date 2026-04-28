import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type SemanticColors = (typeof Colors)[keyof typeof Colors];

export function createBatchSheetPhotosStyles(colors: SemanticColors) {
  return StyleSheet.create({
    wrap: { gap: 10 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: `${colors.primary}1f`,
    },
    uploadText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    disabled: { opacity: 0.5 },
    empty: {
      alignItems: 'center',
      gap: 6,
      paddingVertical: 22,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderStyle: 'dashed',
      backgroundColor: colors.muted,
    },
    emptyTitle: { fontSize: 13, color: colors.mutedForeground },
    emptyHint: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tile: {
      width: '31%',
      aspectRatio: 1,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.muted,
    },
    image: { width: '100%', height: '100%' },
    remove: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#b91c1c',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

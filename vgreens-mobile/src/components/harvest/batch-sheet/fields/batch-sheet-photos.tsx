import { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ImageIcon, X } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface BatchSheetPhotosProps {
  photos: string[];
  disabled?: boolean;
  onRemove: (index: number) => void;
}

export function BatchSheetPhotos({
  photos,
  disabled,
  onRemove,
}: BatchSheetPhotosProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 10 },
        title: { fontSize: 15, fontWeight: '700', color: colors.foreground },
        empty: {
          alignItems: 'center',
          gap: 6,
          paddingVertical: 18,
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
      }),
    [colors],
  );

  if (photos.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Photos</Text>
        <View style={styles.empty}>
          <ImageIcon size={22} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyHint}>
            Photos for this harvest can be added from the web app.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Photos</Text>
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.tile}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            {!disabled && (
              <Pressable
                onPress={() => onRemove(index)}
                style={styles.remove}
                hitSlop={8}
                accessibilityLabel="Remove photo"
              >
                <X size={12} color="#fff" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

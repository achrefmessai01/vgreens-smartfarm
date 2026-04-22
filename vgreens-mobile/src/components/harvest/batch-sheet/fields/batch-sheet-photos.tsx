import { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon, Upload, X } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { createBatchSheetPhotosStyles } from './batch-sheet-photos.styles';

interface BatchSheetPhotosProps {
  photos: string[];
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (assets: ImagePicker.ImagePickerAsset[]) => void | Promise<void>;
  onRemove: (index: number) => void;
}

export function BatchSheetPhotos({
  photos,
  disabled,
  uploading,
  onUpload,
  onRemove,
}: BatchSheetPhotosProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchSheetPhotosStyles(colors), [colors]);

  const handlePick = async () => {
    if (disabled) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.85,
    });
    if (!result.canceled) await onUpload(result.assets);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <Pressable
          onPress={handlePick}
          style={[styles.uploadBtn, disabled && styles.disabled]}
          disabled={disabled}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Upload size={14} color={colors.primary} />
          )}
          <Text style={styles.uploadText}>
            {uploading ? 'Uploading…' : 'Add photos'}
          </Text>
        </Pressable>
      </View>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <ImageIcon size={22} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyHint}>Add photos from your camera roll.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.tile}>
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              {!disabled && (
                <Pressable
                  onPress={() => onRemove(index)}
                  style={styles.remove}
                  hitSlop={8}
                >
                  <X size={12} color="#fff" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

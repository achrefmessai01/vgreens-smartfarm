import { useCallback } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useUploadHarvestImageMutation } from '@/generated/graphql';

// apollo-upload-client + React Native's FormData accept this file shape.
// (See https://github.com/jaydenseric/apollo-upload-client#react-native.)
type RNFile = {
  uri: string;
  name: string;
  type: string;
};

function toRNFile(asset: ImagePickerAsset): RNFile {
  const name =
    asset.fileName ??
    `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
  const type = asset.mimeType ?? 'image/jpeg';
  return { uri: asset.uri, name, type };
}

export function useHarvestPhotosUpload(harvestId: string | null) {
  const [uploadHarvestImage, { loading }] = useUploadHarvestImageMutation();

  const uploadPhotos = useCallback(
    async (assets: ImagePickerAsset[]): Promise<string[]> => {
      if (!harvestId || assets.length === 0) return [];
      const folder = `harvests/${harvestId}`;

      const results = await Promise.all(
        assets.map((asset) =>
          uploadHarvestImage({
            variables: {
              input: { folder, file: toRNFile(asset) as unknown as File },
            },
          }),
        ),
      );

      return results
        .map((r) => r.data?.uploadImage?.url ?? null)
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        );
    },
    [harvestId, uploadHarvestImage],
  );

  return { uploadPhotos, uploading: loading };
}

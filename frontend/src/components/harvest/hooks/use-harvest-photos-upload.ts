import { useUploadHarvestImageMutation } from '@/generated/graphql';
import * as React from 'react';

export function useHarvestPhotosUpload(harvestId: string | null) {
  const [uploadHarvestImage, { loading }] = useUploadHarvestImageMutation();

  const uploadPhotos = React.useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!harvestId || files.length === 0) return [];

      const folder = `harvests/${harvestId}`;

      const results = await Promise.all(
        files.map((file) =>
          uploadHarvestImage({
            variables: {
              input: {
                folder,
                file,
              },
            },
          }),
        ),
      );

      const urls = results
        .map((result) => result.data?.uploadImage?.url ?? null)
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        );

      return urls;
    },
    [harvestId, uploadHarvestImage],
  );

  return {
    uploadPhotos,
    uploading: loading,
  };
}

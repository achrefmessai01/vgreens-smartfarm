import * as React from 'react';
import { useUploadHarvestImageMutation } from '@/generated/graphql';

export function useHarvestPhotosUpload(harvestId: string | null) {
  const [uploadHarvestImage, { loading }] = useUploadHarvestImageMutation();

  const uploadPhotos = React.useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!harvestId || files.length === 0) return [];

      const folder = `harvests/${harvestId}`;

      const results = await Promise.all(
        files.map((file) =>
          uploadHarvestImage({
            variables: { input: { folder, file } },
          }),
        ),
      );

      return results
        .map((result) => result.data?.uploadImage?.url ?? null)
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        );
    },
    [harvestId, uploadHarvestImage],
  );

  return { uploadPhotos, uploading: loading };
}

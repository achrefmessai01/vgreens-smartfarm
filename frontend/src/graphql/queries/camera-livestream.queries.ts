import { gql } from '@apollo/client';

export const CAMERA_LIVESTREAM_FEEDS_QUERY = gql`
  query CameraLivestreamFeeds {
    cameraLivestreamFeeds {
      id
      name
      path
      snapshotUrl
      updatedAt
      expiresAt
      available
      error
    }
  }
`;

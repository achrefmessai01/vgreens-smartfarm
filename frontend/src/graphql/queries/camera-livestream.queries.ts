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

export const CAMERA_LIVESTREAM_STREAM_URL_QUERY = gql`
  query CameraLivestreamStreamUrl($cameraId: String!) {
    cameraLivestreamStreamUrl(cameraId: $cameraId) {
      cameraId
      url
      expiresAt
      available
      error
    }
  }
`;

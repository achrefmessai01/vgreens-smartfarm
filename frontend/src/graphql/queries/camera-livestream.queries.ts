import { gql } from '@apollo/client';

export const CAMERA_LIVESTREAM_FEEDS_QUERY = gql`
  query CameraLivestreamFeeds($tenantId: String) {
    cameraLivestreamFeeds(tenantId: $tenantId) {
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
  query CameraLivestreamStreamUrl($cameraId: String!, $tenantId: String) {
    cameraLivestreamStreamUrl(cameraId: $cameraId, tenantId: $tenantId) {
      cameraId
      url
      expiresAt
      available
      error
    }
  }
`;

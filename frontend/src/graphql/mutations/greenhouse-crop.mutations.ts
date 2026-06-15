import { gql } from '@apollo/client';

// Add/remove which crops a greenhouse may grow. The catalog itself is read-only
// (maintained by vGreens Admin outside this app); only the assignment changes.
export const ASSIGN_CROP_TO_GREENHOUSE_MUTATION = gql`
  mutation AssignCropToGreenhouse($greenhouseId: ID!, $cropId: ID!) {
    assignCropToGreenhouse(greenhouseId: $greenhouseId, cropId: $cropId) {
      id
      greenhouseId
      cropId
    }
  }
`;

export const UNASSIGN_CROP_FROM_GREENHOUSE_MUTATION = gql`
  mutation UnassignCropFromGreenhouse($greenhouseId: ID!, $cropId: ID!) {
    unassignCropFromGreenhouse(greenhouseId: $greenhouseId, cropId: $cropId)
  }
`;

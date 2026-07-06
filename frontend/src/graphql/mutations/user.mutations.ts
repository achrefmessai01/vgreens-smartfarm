import { gql } from '@apollo/client';

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      isActive
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!, $tenantId: ID) {
    updateUser(id: $id, input: $input, tenantId: $tenantId) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!, $tenantId: ID) {
    deleteUser(id: $id, tenantId: $tenantId)
  }
`;

// The three settings mutations below all select the FULL userSettings object:
// it is cached un-normalized on the User, so a partial selection would replace
// the cached blob and drop the sibling keys the mutation didn't touch.

export const SET_MY_LANGUAGE_MUTATION = gql`
  mutation SetMyLanguage($language: String!) {
    setMyLanguage(language: $language) {
      id
      userSettings {
        preferredLanguage
        farmOverviewTimeRange
        harvestView {
          sort {
            field
            direction
          }
          range
          collapsedBatchIds
        }
      }
    }
  }
`;

export const SET_MY_FARM_OVERVIEW_TIME_RANGE_MUTATION = gql`
  mutation SetMyFarmOverviewTimeRange($value: String!) {
    setMyFarmOverviewTimeRange(value: $value) {
      id
      userSettings {
        preferredLanguage
        farmOverviewTimeRange
        harvestView {
          sort {
            field
            direction
          }
          range
          collapsedBatchIds
        }
      }
    }
  }
`;

export const UPDATE_MY_HARVEST_VIEW_SETTINGS_MUTATION = gql`
  mutation UpdateMyHarvestViewSettings($input: HarvestViewSettingsInput!) {
    updateMyHarvestViewSettings(input: $input) {
      id
      userSettings {
        preferredLanguage
        farmOverviewTimeRange
        harvestView {
          sort {
            field
            direction
          }
          range
          collapsedBatchIds
        }
      }
    }
  }
`;

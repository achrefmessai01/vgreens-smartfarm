import { gql } from '@apollo/client';

// Crops are global, read-only reference data. Passing a greenhouseId returns
// only the crops that greenhouse may grow (drives the batch crop selector and
// the greenhouse crop-assignment UI); omitting it returns the whole catalog.
export const CROPS_QUERY = gql`
  query Crops($greenhouseId: ID) {
    crops(greenhouseId: $greenhouseId) {
      id
      name
    }
  }
`;

// Live varieties belonging to a crop (cascading selector: crop -> varieties).
// Varieties are shared across tenants, so no tenant argument is needed.
export const VARIETIES_QUERY = gql`
  query Varieties($cropId: ID!) {
    varieties(cropId: $cropId) {
      id
      name
      description
    }
  }
`;

// Adds a new variety under the form's currently-selected crop. Admin-only on
// the backend (VGREENS_ADMIN / TENANT_ADMIN).
export const CREATE_VARIETY_MUTATION = gql`
  mutation CreateVariety($input: CreateVarietyInput!) {
    createVariety(input: $input) {
      id
      name
      cropId
      description
    }
  }
`;

// Rename or edit the description of an existing variety. Admin-only.
export const UPDATE_VARIETY_MUTATION = gql`
  mutation UpdateVariety($id: ID!, $input: UpdateVarietyInput!) {
    updateVariety(id: $id, input: $input) {
      id
      name
      cropId
      description
    }
  }
`;

// Soft-deletes a variety. Batches referencing it keep working, but the row
// stops appearing in the dropdown. Admin-only.
export const DELETE_VARIETY_MUTATION = gql`
  mutation DeleteVariety($id: ID!) {
    deleteVariety(id: $id)
  }
`;

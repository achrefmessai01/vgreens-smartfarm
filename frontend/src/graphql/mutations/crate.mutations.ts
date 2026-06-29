import { gql } from '@apollo/client';

// Adds a crate for the current tenant from the harvest sidebar's crate dropdown.
// tenantId/createdById are stamped server-side from the caller; the client only
// supplies the weight. A same-weight crate is returned idempotently by the
// backend, so this is safe to call even if the weight already exists.
export const CREATE_CRATE_MUTATION = gql`
  mutation CreateCrate($input: CreateCrateInput!) {
    createCrate(input: $input) {
      id
      weight
    }
  }
`;

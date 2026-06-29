import { gql } from '@apollo/client';

/**
 * Adds a crate for the current tenant (tenantId/createdById are stamped
 * server-side). Idempotent: a same-weight crate is returned as-is, so it's safe
 * to call even if the weight already exists.
 */
export const CREATE_CRATE_MUTATION = gql`
  mutation CreateCrate($input: CreateCrateInput!) {
    createCrate(input: $input) {
      id
      weight
    }
  }
`;

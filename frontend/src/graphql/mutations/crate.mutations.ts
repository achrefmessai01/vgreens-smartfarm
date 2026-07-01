import { gql } from '@apollo/client';

/**
 * Adds a crate for a tenant (createdById is stamped server-side). Pass the
 * selected tenantId so an admin adds it to the tenant they're working in;
 * non-admins are pinned to their own tenant. Idempotent: a same-weight crate is
 * returned as-is, so it's safe to call even if the weight already exists.
 */
export const CREATE_CRATE_MUTATION = gql`
  mutation CreateCrate($input: CreateCrateInput!, $tenantId: ID) {
    createCrate(input: $input, tenantId: $tenantId) {
      id
      weight
    }
  }
`;

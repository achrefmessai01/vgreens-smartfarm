import { gql } from '@apollo/client';

/**
 * Crates for the harvest sidebar's crate dropdown, scoped to a tenant. Pass the
 * selected tenantId so an admin only sees (and can only pick) crates of the
 * tenant they're working in; non-admins fall back to their own tenant regardless
 * of the value.
 */
export const CRATES_QUERY = gql`
  query Crates($tenantId: ID) {
    crates(tenantId: $tenantId) {
      id
      weight
    }
  }
`;

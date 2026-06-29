import { gql } from '@apollo/client';

// Crates are tenant-scoped: the backend filters by the caller's tenant, so this
// takes no arguments and only ever returns the current tenant's crates. Lightest
// first (the backend orders by weight asc). Drives the harvest sidebar's crate
// dropdown in crate mode.
export const CRATES_QUERY = gql`
  query Crates {
    crates {
      id
      weight
    }
  }
`;

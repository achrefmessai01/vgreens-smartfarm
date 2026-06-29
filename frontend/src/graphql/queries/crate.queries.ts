import { gql } from '@apollo/client';

/**
 * Current tenant's crates (the backend scopes by caller, lightest first), source
 * for the harvest sidebar's crate dropdown. Takes no arguments.
 */
export const CRATES_QUERY = gql`
  query Crates {
    crates {
      id
      weight
    }
  }
`;

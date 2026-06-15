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
export const VARIETIES_QUERY = gql`
  query Varieties($cropId: ID!) {
    varieties(cropId: $cropId) {
      id
      name
    }
  }
`;

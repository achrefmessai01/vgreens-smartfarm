import { gql } from '@apollo/client';

// Shared selection for a harvest event in the normalized model: the slim
// harvest row + its parent batch (planting data), its entries (per-position
// measurements) and the service-computed totals.
const HARVEST_FIELDS = gql`
  fragment HarvestFields on Harvest {
    id
    tenantId
    createdById
    batchId
    date
    startTime
    stopTime
    harvesterHeadCount
    photoUrls
    createdAt
    updatedAt
    batch {
      id
      name
      cropId
      varietyId
      crop {
        id
        name
      }
      variety {
        id
        name
      }
      status
      batchNumber
      greenhouseId
      plantingDate
      cultivationArea
      numberOfRows
      rowLength
      runningMeter
      plantsPerMeter
      rowSpacing
      startRow
      endRow
      totalPlants
      lostPlants
      replicates
      inputMode
      crateWeight
      greenhouse {
        id
        name
      }
    }
    entries {
      id
      rowX
      rowY
      classKgs
      waste
      crateCounts
      remainingKgs
      totalFruitWeight
      avgFruitWeight
      sampleWeight
      sampleFruitCount
      avgBrix
      brixReadings {
        class
        value
      }
    }
    totals {
      classKgs
      waste
      fruitCount
      totalFruitWeight
      crateCounts
      avgFruitWeight
      avgBrix
      yieldPerPlant
      yieldPerMeter
      yieldPerRunningMeter
    }
    createdBy {
      id
      firstName
      lastName
      email
    }
  }
`;

export const HARVESTS_QUERY = gql`
  query Harvests($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      ...HarvestFields
    }
  }
  ${HARVEST_FIELDS}
`;

export const HARVEST_QUERY = gql`
  query Harvest($id: ID!) {
    harvest(id: $id) {
      ...HarvestFields
    }
  }
  ${HARVEST_FIELDS}
`;

export const HARVESTS_CSV_EXPORT_QUERY = gql`
  query HarvestsCsvExport($filter: HarvestFilterInput, $columns: [String!]) {
    harvestsCsvExport(filter: $filter, columns: $columns)
  }
`;

// Lightweight selection for counting / quick metrics over the harvest list.
export const HARVESTS_COUNT_QUERY = gql`
  query HarvestsCount($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      id
      batchId
      date
      batch {
        id
        status
      }
      totals {
        classKgs
        waste
        avgBrix
      }
    }
  }
`;

export const HARVEST_IMAGES_QUERY = gql`
  query HarvestImages($folder: String) {
    images(input: { folder: $folder }) {
      path
      filename
      mimeType
      url
    }
  }
`;

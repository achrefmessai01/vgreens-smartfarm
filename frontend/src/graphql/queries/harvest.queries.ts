import { gql } from '@apollo/client';

export const HARVESTS_QUERY = gql`
  query Harvests($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      id
      tenantId
      createdById
      species
      variety
      batch
      batchNumber
      parentBatchId
      greenhouse
      plantingDate
      cultivationArea
      numberOfRows
      rowLength
      plantsPerMeter
      rowSpacing
      totalPlants
      lostPlants
      status
      date
      classA
      classB
      classC
      waste
      avgBrix
      rowX
      rowY
      brixReadings
      brixClasses
      fruitCount
      totalFruitWeight
      avgFruitWeight
      photos
      photoUrls
      entries {
        classA
        classB
        classC
        waste
        rowX
        rowY
        avgBrix
        brixReadings
        brixClasses
        fruitCount
        totalFruitWeight
        avgFruitWeight
      }
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const HARVEST_QUERY = gql`
  query Harvest($id: ID!) {
    harvest(id: $id) {
      id
      tenantId
      createdById
      species
      variety
      batch
      batchNumber
      parentBatchId
      greenhouse
      plantingDate
      cultivationArea
      numberOfRows
      rowLength
      plantsPerMeter
      rowSpacing
      totalPlants
      lostPlants
      status
      date
      classA
      classB
      classC
      waste
      avgBrix
      rowX
      rowY
      brixReadings
      brixClasses
      fruitCount
      totalFruitWeight
      avgFruitWeight
      photos
      photoUrls
      entries {
        classA
        classB
        classC
        waste
        rowX
        rowY
        avgBrix
        brixReadings
        brixClasses
        fruitCount
        totalFruitWeight
        avgFruitWeight
      }
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const HARVESTS_CSV_EXPORT_QUERY = gql`
  query HarvestsCsvExport($filter: HarvestFilterInput, $columns: [String!]) {
    harvestsCsvExport(filter: $filter, columns: $columns)
  }
`;

export const HARVESTS_COUNT_QUERY = gql`
  query HarvestsCount($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      id
      parentBatchId
      status
      classA
      classB
      classC
      waste
      avgBrix
      rowX
      rowY
      photos
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

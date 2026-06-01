import { gql } from '@apollo/client';

export const CREATE_HARVEST_MUTATION = gql`
  mutation CreateHarvest($input: CreateHarvestInput!) {
    createHarvest(input: $input) {
      id
      tenantId
      createdById
      species
      variety
      batch
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
      waste
      avgBrix
      rowX
      rowY
      brixReadings
      fruitCount
      totalFruitWeight
      avgFruitWeight
      photos
      photoUrls
      entries {
        classA
        classB
        waste
        rowX
        rowY
        avgBrix
        brixReadings
        fruitCount
        totalFruitWeight
        avgFruitWeight
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_HARVEST_MUTATION = gql`
  mutation UpdateHarvest($id: ID!, $input: UpdateHarvestInput!) {
    updateHarvest(id: $id, input: $input) {
      id
      tenantId
      createdById
      species
      variety
      batch
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
      waste
      avgBrix
      rowX
      rowY
      brixReadings
      fruitCount
      totalFruitWeight
      avgFruitWeight
      photos
      photoUrls
      entries {
        classA
        classB
        waste
        rowX
        rowY
        avgBrix
        brixReadings
        fruitCount
        totalFruitWeight
        avgFruitWeight
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_HARVEST_MUTATION = gql`
  mutation DeleteHarvest($id: ID!) {
    deleteHarvest(id: $id)
  }
`;

export const UPLOAD_HARVEST_IMAGE_MUTATION = gql`
  mutation UploadHarvestImage($input: UploadImageInput!) {
    uploadImage(input: $input) {
      path
      filename
      bucket
      mimeType
      url
    }
  }
`;

export const DELETE_HARVEST_IMAGE_MUTATION = gql`
  mutation DeleteHarvestImage($path: String!) {
    deleteImage(input: { path: $path })
  }
`;

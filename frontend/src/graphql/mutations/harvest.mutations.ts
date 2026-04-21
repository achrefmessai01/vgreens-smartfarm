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
      status
      date
      classA
      waste
      avgBrix
      numberOfRowsHarvested
      brix1
      brix2
      brix3
      brix4
      brix5
      brix6
      brix7
      brix8
      brix9
      brix10
      photos
      photoUrls
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
      status
      date
      classA
      waste
      avgBrix
      numberOfRowsHarvested
      brix1
      brix2
      brix3
      brix4
      brix5
      brix6
      brix7
      brix8
      brix9
      brix10
      photos
      photoUrls
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

import { gql } from '@apollo/client';

// A harvest event now references a batch and carries multiple entries; all
// measurement totals are derived by the backend service and returned in
// `totals`.
const HARVEST_MUTATION_FIELDS = gql`
  fragment HarvestMutationFields on Harvest {
    id
    tenantId
    createdById
    batchId
    date
    photoUrls
    createdAt
    updatedAt
    batch {
      id
      name
      crop {
        id
        name
      }
      variety {
        id
        name
      }
      status
      totalPlants
      rowLength
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
      fruitCount
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
      classA
      classB
      classC
      waste
      fruitCount
      totalFruitWeight
      crateCounts
      avgFruitWeight
      avgBrix
      yieldPerPlant
      yieldPerMeter
    }
  }
`;

export const CREATE_HARVEST_MUTATION = gql`
  mutation CreateHarvest($input: CreateHarvestInput!) {
    createHarvest(input: $input) {
      ...HarvestMutationFields
    }
  }
  ${HARVEST_MUTATION_FIELDS}
`;

export const UPDATE_HARVEST_MUTATION = gql`
  mutation UpdateHarvest($id: ID!, $input: UpdateHarvestInput!) {
    updateHarvest(id: $id, input: $input) {
      ...HarvestMutationFields
    }
  }
  ${HARVEST_MUTATION_FIELDS}
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

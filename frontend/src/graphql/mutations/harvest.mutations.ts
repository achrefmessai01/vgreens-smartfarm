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
    startTime
    stopTime
    harvesterHeadCount
    photoUrls
    createdAt
    updatedAt
    inputMode
    crateId
    crate {
      id
      weight
    }
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
      runningMeter
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
      yieldPerRunningMeter
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
  mutation UpdateHarvest(
    $id: ID!
    $input: UpdateHarvestInput!
    $tenantId: ID
  ) {
    updateHarvest(id: $id, input: $input, tenantId: $tenantId) {
      ...HarvestMutationFields
    }
  }
  ${HARVEST_MUTATION_FIELDS}
`;

// Flip ONE harvest between weight and crate mode, converting its entries in
// place. `crateId` is required when switching to crate mode (the harvest is
// pointed at it) and ignored when switching to weight. Returns the harvest with
// its converted entries + new inputMode, so Apollo renormalizes it by id.
export const CONVERT_HARVEST_INPUT_MODE_MUTATION = gql`
  mutation ConvertHarvestInputMode(
    $harvestId: ID!
    $targetMode: InputMode!
    $crateId: ID
    $tenantId: ID
  ) {
    convertHarvestInputMode(
      harvestId: $harvestId
      targetMode: $targetMode
      crateId: $crateId
      tenantId: $tenantId
    ) {
      ...HarvestMutationFields
    }
  }
  ${HARVEST_MUTATION_FIELDS}
`;

export const DELETE_HARVEST_MUTATION = gql`
  mutation DeleteHarvest($id: ID!, $tenantId: ID) {
    deleteHarvest(id: $id, tenantId: $tenantId)
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

export const IMPORT_HARVEST_MUTATION = gql`
  mutation ImportHarvest($input: ImportHarvestInput!) {
    importHarvest(input: $input) {
      tenant
      tenantId
      file
      mapper
      dryRun
      startedAt
      finishedAt
      totalRows
      validRows
      invalidRows
      created
      skippedDuplicates
      failed
      issues {
        sourceRow
        level
        reason
      }
      globalWarnings
    }
  }
`;

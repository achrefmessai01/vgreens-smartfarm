import { gql } from '@apollo/client'

export const HARVESTS_QUERY = gql`
  query Harvests($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      id
      tenantId
      createdById
      species
      variety
      batch
      greenhouse
      plantingDate
      cultivationArea
      status
      date
      classA
      waste
      avgBrix
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
      createdBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`

export const HARVEST_QUERY = gql`
  query Harvest($id: ID!) {
    harvest(id: $id) {
      id
      tenantId
      createdById
      species
      variety
      batch
      greenhouse
      plantingDate
      cultivationArea
      status
      date
      classA
      waste
      avgBrix
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
      createdBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`

import { gql } from '@apollo/client'

export const GET_BUCKET_DATA_QUERY = gql`
  query GetBucketData(
    $bucketName: String!
    $start: String
    $stop: String
    $limit: Int
  ) {
    getBucketData(
      bucketName: $bucketName
      start: $start
      stop: $stop
      limit: $limit
    ) {
      data
    }
  }
`

export const GET_BUCKET_FIELDS_QUERY = gql`
  query GetBucketFields($bucketName: String!, $start: String, $stop: String) {
    getBucketFields(bucketName: $bucketName, start: $start, stop: $stop)
  }
`

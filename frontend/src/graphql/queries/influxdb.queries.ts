import { gql } from '@apollo/client'

export const GET_BUCKET_DATA_QUERY = gql`
  query GetBucketData(
    $bucketName: String!
    $start: String
    $stop: String
    $limit: Int
    $field: String
    $greenhouse: String
    $device: String
    $level: String
  ) {
    getBucketData(
      bucketName: $bucketName
      start: $start
      stop: $stop
      limit: $limit
      field: $field
      greenhouse: $greenhouse
      device: $device
      level: $level
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

export const GET_BUCKET_FIELD_MEANS_LAST_MINUTES_QUERY = gql`
  query GetBucketFieldMeansLastMinutes($input: GetFieldMeansInput!) {
    getBucketFieldMeansLastMinutes(input: $input) {
      field
      greenhouse
      value
    }
  }
`

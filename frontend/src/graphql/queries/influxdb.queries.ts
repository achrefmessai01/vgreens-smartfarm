import { gql } from '@apollo/client';

export const GET_BUCKET_DATA_QUERY = gql`
  query GetBucketData($input: GetBucketDataInput!) {
    getBucketData(input: $input) {
      data
    }
  }
`;

export const GET_BUCKET_FIELDS_QUERY = gql`
  query GetBucketFields($bucketName: String!, $start: String, $stop: String) {
    getBucketFields(bucketName: $bucketName, start: $start, stop: $stop)
  }
`;

export const GET_BUCKET_FIELD_MEANS_LAST_MINUTES_QUERY = gql`
  query GetBucketFieldMeansLastMinutes($input: GetFieldMeansInput!) {
    getBucketFieldMeansLastMinutes(input: $input) {
      field
      greenhouse
      chamber
      value
    }
  }
`;

export const GET_PAR_DLI_FOR_TENANT_QUERY = gql`
  query GetParDliForTenant($tenantId: ID, $timezone: String) {
    getParDliForTenant(input: { tenantId: $tenantId, timezone: $timezone }) {
      combined {
        currentPPFD
        currentDLI
        todaysGraphData {
          time
          dli
        }
        lowerEdge {
          hour
          dli
        }
        upperEdge {
          hour
          dli
        }
      }
      greenhouses {
        name
        data {
          currentPPFD
          currentDLI
          todaysGraphData {
            time
            dli
          }
          lowerEdge {
            hour
            dli
          }
          upperEdge {
            hour
            dli
          }
        }
      }
    }
  }
`;

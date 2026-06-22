import { gql } from '@apollo/client';

export const DEVICE_STATUSES_QUERY = gql`
  query DeviceStatuses($input: DeviceStatusInput) {
    deviceStatuses(input: $input) {
      device
      state
      deviceClass
      messageTypes
      realMessageTypes
      online
      lastAlive
      lastRealData
      realDataPoints
      heartbeatDataPoints
      lastValues {
        field
        value
        time
      }
      greenhouse
      xPosition
      yPosition
      city
      hiddenInFarmOverview
    }
  }
`;

export const DEVICE_ACTIVITY_SERIES_QUERY = gql`
  query DeviceActivitySeries($input: DeviceStatusInput) {
    deviceActivitySeries(input: $input) {
      time
      count
    }
  }
`;

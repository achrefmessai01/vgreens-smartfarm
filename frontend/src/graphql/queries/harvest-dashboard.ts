import { gql } from '@apollo/client';

export const GET_HARVEST_DASHBOARD = gql`
  query GetHarvestDashboard($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      averageFruitWeight
      yieldPerPlant
      yieldPerMeter
      yieldPerRunningMeter
      marketablePercent
      wastePercent
      wasteTotal
      classBTotal
      classCTotal
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      yieldPerMeterTrend {
        date
        yieldPerMeter
      }
      classDistribution {
        date
        classes
        waste
      }
      brixTrend {
        date
        brix
      }
      fruitWeightTrend {
        date
        weight
      }
      cumulativeYield {
        date
        cumulativeSellable
        cumulativeWaste
      }
    }
  }
`;

export const GET_HARVEST_DASHBOARD_WITH_VARIABLES = gql`
  query GetHarvestDashboardWithVariables(
    $filter: DashboardFilterInput
    $tenantId: ID
    $species: String
    $variety: String
    $batch: String
    $dateFrom: String
    $dateTo: String
    $greenhouseId: ID
  ) {
    harvestDashboard(
      filter: {
        tenantId: $tenantId
        species: $species
        variety: $variety
        batch: $batch
        dateFrom: $dateFrom
        dateTo: $dateTo
        greenhouseId: $greenhouseId
      }
    ) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      averageFruitWeight
      yieldPerPlant
      yieldPerMeter
      yieldPerRunningMeter
      marketablePercent
      wastePercent
      wasteTotal
      classBTotal
      classCTotal
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      yieldPerMeterTrend {
        date
        yieldPerMeter
      }
      classDistribution {
        date
        classes
        waste
      }
      brixTrend {
        date
        brix
      }
      fruitWeightTrend {
        date
        weight
      }
      cumulativeYield {
        date
        cumulativeSellable
        cumulativeWaste
      }
    }
  }
`;

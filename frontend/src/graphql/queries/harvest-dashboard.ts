import { gql } from '@apollo/client';

export const GET_HARVEST_DASHBOARD = gql`
  query GetHarvestDashboard($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      averageFruitWeight
      yieldPerPlant
      yieldPerRunningMeter
      yieldPerSquareMeter
      marketablePercent
      wastePercent
      wasteTotal
      classTotals
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      yieldPerRunningMeterTrend {
        date
        yieldPerRunningMeter
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
      yieldPerRunningMeter
      yieldPerSquareMeter
      marketablePercent
      wastePercent
      wasteTotal
      classTotals
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      yieldPerRunningMeterTrend {
        date
        yieldPerRunningMeter
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

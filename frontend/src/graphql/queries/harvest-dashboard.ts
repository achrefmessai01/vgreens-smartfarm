import { gql } from '@apollo/client';

export const GET_HARVEST_DASHBOARD = gql`
  query GetHarvestDashboard($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      marketablePercent
      wastePercent
      wasteTotal
      classBTotal
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      classDistribution {
        date
        marketable
        classB
        waste
      }
      brixTrend {
        date
        brix
      }
      cumulativeYield {
        date
        cumulative
        cumulativeClassB
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
    $greenhouse: String
  ) {
    harvestDashboard(
      filter: {
        tenantId: $tenantId
        species: $species
        variety: $variety
        batch: $batch
        dateFrom: $dateFrom
        dateTo: $dateTo
        greenhouse: $greenhouse
      }
    ) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      marketablePercent
      wastePercent
      wasteTotal
      classBTotal
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      classDistribution {
        date
        marketable
        classB
        waste
      }
      brixTrend {
        date
        brix
      }
      cumulativeYield {
        date
        cumulative
        cumulativeClassB
        cumulativeWaste
      }
    }
  }
`;

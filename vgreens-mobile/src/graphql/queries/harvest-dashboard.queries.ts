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
      criticalAlerts
      daysActive
      yieldOverTime {
        date
        yield
      }
      classDistribution {
        date
        marketable
        waste
      }
      brixTrend {
        date
        brix
      }
      cumulativeYield {
        date
        cumulative
        cumulativeWaste
      }
    }
  }
`;

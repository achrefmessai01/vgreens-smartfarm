import { gql } from '@apollo/client';

// Query for just the dashboard metrics (without chart data)
export const GET_HARVEST_METRICS = gql`
  query GetHarvestMetrics($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      species
      variety
      harvestCount
      totalYield
      averageBrix
      averageFruitWeight
      yieldPerPlant
      marketablePercent
      wastePercent
      wasteTotal
      classTotals
      criticalAlerts
      daysActive
    }
  }
`;

// Query for yield over time chart data
export const GET_YIELD_OVER_TIME = gql`
  query GetYieldOverTime($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      yieldOverTime {
        date
        yield
      }
    }
  }
`;

// Query for class distribution chart data
export const GET_CLASS_DISTRIBUTION = gql`
  query GetClassDistribution($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      classDistribution {
        date
        classes
        waste
      }
    }
  }
`;

// Query for brix trend chart data
export const GET_BRIX_TREND = gql`
  query GetBrixTrend($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      brixTrend {
        date
        brix
      }
    }
  }
`;

// Query for fruit weight trend chart data
export const GET_FRUIT_WEIGHT_TREND = gql`
  query GetFruitWeightTrend($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      fruitWeightTrend {
        date
        weight
      }
    }
  }
`;

// Query for cumulative yield chart data
export const GET_CUMULATIVE_YIELD = gql`
  query GetCumulativeYield($filter: DashboardFilterInput, $tenantId: ID) {
    harvestDashboard(filter: $filter, tenantId: $tenantId) {
      cumulativeYield {
        date
        cumulativeSellable
        cumulativeWaste
      }
    }
  }
`;

// Query for harvest summary statistics
export const GET_HARVEST_SUMMARY = gql`
  query GetHarvestSummary($filter: HarvestFilterInput, $tenantId: ID) {
    harvests(filter: $filter, tenantId: $tenantId) {
      id
      date
      createdAt
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
        greenhouse {
          id
          name
        }
      }
      totals {
        classKgs
        waste
        avgBrix
      }
    }
  }
`;

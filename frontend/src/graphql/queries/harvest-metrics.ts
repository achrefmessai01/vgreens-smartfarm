import { gql } from '@apollo/client';

// Query for just the dashboard metrics (without chart data)
export const GET_HARVEST_METRICS = gql`
  query GetHarvestMetrics($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
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
      classBTotal
      classCTotal
      criticalAlerts
      daysActive
    }
  }
`;

// Query for yield over time chart data
export const GET_YIELD_OVER_TIME = gql`
  query GetYieldOverTime($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      yieldOverTime {
        date
        yield
      }
    }
  }
`;

// Query for class distribution chart data
export const GET_CLASS_DISTRIBUTION = gql`
  query GetClassDistribution($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      classDistribution {
        date
        marketable
        classB
        classC
        waste
      }
    }
  }
`;

// Query for brix trend chart data
export const GET_BRIX_TREND = gql`
  query GetBrixTrend($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      brixTrend {
        date
        brix
      }
    }
  }
`;

// Query for fruit weight trend chart data
export const GET_FRUIT_WEIGHT_TREND = gql`
  query GetFruitWeightTrend($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      fruitWeightTrend {
        date
        weight
      }
    }
  }
`;

// Query for cumulative yield chart data
export const GET_CUMULATIVE_YIELD = gql`
  query GetCumulativeYield($filter: DashboardFilterInput) {
    harvestDashboard(filter: $filter) {
      cumulativeYield {
        date
        cumulativeClassA
        cumulativeClassB
        cumulativeClassC
        cumulativeWaste
      }
    }
  }
`;

// Query for harvest summary statistics
export const GET_HARVEST_SUMMARY = gql`
  query GetHarvestSummary($filter: HarvestFilterInput) {
    harvests(filter: $filter) {
      id
      date
      classA
      classB
      classC
      waste
      avgBrix
      species
      variety
      batch
      greenhouse
      status
      createdAt
    }
  }
`;

import { gql } from '@apollo/client';

export const CREATE_IRRIGATION_CYCLE_MUTATION = gql`
  mutation CreateIrrigationCycle(
    $input: CreateIrrigationCycleInput!
    $tenantId: ID
  ) {
    createIrrigationCycle(input: $input, tenantId: $tenantId) {
      id
      name
      greenhouseId
      greenhouse
    }
  }
`;

export const UPDATE_IRRIGATION_CYCLE_MUTATION = gql`
  mutation UpdateIrrigationCycle(
    $id: ID!
    $input: UpdateIrrigationCycleInput!
    $tenantId: ID
  ) {
    updateIrrigationCycle(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      greenhouseId
      greenhouse
    }
  }
`;

/** Blocked server-side while the cycle still has sensors assigned. */
export const DELETE_IRRIGATION_CYCLE_MUTATION = gql`
  mutation DeleteIrrigationCycle($id: ID!, $tenantId: ID) {
    deleteIrrigationCycle(id: $id, tenantId: $tenantId)
  }
`;

/**
 * Assign a SOIL sensor to a cycle in the same greenhouse; pass
 * irrigationCycleId: null to unassign. Both rules are enforced server-side.
 */
export const ASSIGN_SENSOR_TO_IRRIGATION_CYCLE_MUTATION = gql`
  mutation AssignSensorToIrrigationCycle(
    $sensorConfigId: ID!
    $irrigationCycleId: ID
    $tenantId: ID
  ) {
    assignSensorToIrrigationCycle(
      sensorConfigId: $sensorConfigId
      irrigationCycleId: $irrigationCycleId
      tenantId: $tenantId
    ) {
      id
      device
      irrigationCycleId
    }
  }
`;

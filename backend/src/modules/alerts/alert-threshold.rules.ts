import { AlertSeverity } from '@common/enums';
import type { TimeGate } from './alert-threshold-time';

export const INFLUX_FIELDS = {
  airTemp: 'temperature',
  rh: 'humidity',
  vpd: 'vpd',
  vwc: 'soil_moisture',
  ec: 'soil_ec',
  rootTemp: 'soil_temp',
  par: 'par',
  co2: 'co2',
} as const;

export interface SingleThresholdRule {
  type: 'single';
  ruleKey: string;
  severity: AlertSeverity;
  parameter: string;
  field: string;
  triggerOp: 'gt' | 'lt';
  triggerValue: number;
  persistenceMinutes: number;
  clearOp: 'gt' | 'lt';
  clearValue: number;
  clearMinutes: number;
  timeGate: TimeGate;
  rationale: string;
}

export interface CompositeThresholdRule {
  type: 'composite';
  ruleKey: string;
  severity: AlertSeverity;
  parameter: string;
  fieldA: string;
  opA: 'gt' | 'lt';
  valueA: number;
  fieldB: string;
  opB: 'gt' | 'lt';
  valueB: number;
  persistenceMinutes: number;
  clearOpA: 'gt' | 'lt';
  clearValueA: number;
  clearOpB: 'gt' | 'lt';
  clearValueB: number;
  clearMinutes: number;
  timeGate: TimeGate;
  rationale: string;
}

export interface DeltaThresholdRule {
  type: 'delta';
  ruleKey: string;
  severity: AlertSeverity;
  parameter: string;
  field: string;
  direction: 'drop' | 'increase';
  threshold: number;
  windowMinutes: number;
  clearMinutes: number;
  timeGate: TimeGate;
  rationale: string;
}

export type ThresholdRule =
  | SingleThresholdRule
  | CompositeThresholdRule
  | DeltaThresholdRule;

export const THRESHOLD_RULES: ThresholdRule[] = [
  // 1. Air Temp Critical: T > 32, P 20m, H T < 30 for 20m, Day
  {
    type: 'single',
    ruleKey: 'air_temp_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Air Temp (°C)',
    field: INFLUX_FIELDS.airTemp,
    triggerOp: 'gt',
    triggerValue: 32,
    persistenceMinutes: 20,
    clearOp: 'lt',
    clearValue: 30,
    clearMinutes: 20,
    timeGate: 'Day',
    rationale: 'Cooling/vent likely underperforming',
  },
  // 2. Air Temp Warning: T > 30, P 60m, H T < 28 for 30m, 08:00-14:00
  {
    type: 'single',
    ruleKey: 'air_temp_warning_high',
    severity: AlertSeverity.CRITICAL, // use CRITICAL as only severity in enum
    parameter: 'Air Temp (°C)',
    field: INFLUX_FIELDS.airTemp,
    triggerOp: 'gt',
    triggerValue: 30,
    persistenceMinutes: 60,
    clearOp: 'lt',
    clearValue: 28,
    clearMinutes: 30,
    timeGate: { start: '08:00', end: '14:00' },
    rationale: 'Flower/pollen risk',
  },
  // 3. Air Temp Warning: T < 6, P 30m, H T > 8 for 30m, Night
  {
    type: 'single',
    ruleKey: 'air_temp_warning_low',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Air Temp (°C)',
    field: INFLUX_FIELDS.airTemp,
    triggerOp: 'lt',
    triggerValue: 6,
    persistenceMinutes: 30,
    clearOp: 'gt',
    clearValue: 8,
    clearMinutes: 30,
    timeGate: 'Night',
    rationale: 'Cold event / sensor fault',
  },
  // 4. RH Critical: RH > 95, P 60m, H RH < 85 for 30m, Night
  {
    type: 'single',
    ruleKey: 'rh_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'RH (%)',
    field: INFLUX_FIELDS.rh,
    triggerOp: 'gt',
    triggerValue: 95,
    persistenceMinutes: 60,
    clearOp: 'lt',
    clearValue: 85,
    clearMinutes: 30,
    timeGate: 'Night',
    rationale: 'Condensation / Botrytis risk',
  },
  // 5. RH Warning: RH > 85, P 120m, H RH < 80 for 30m, Night
  {
    type: 'single',
    ruleKey: 'rh_warning',
    severity: AlertSeverity.CRITICAL,
    parameter: 'RH (%)',
    field: INFLUX_FIELDS.rh,
    triggerOp: 'gt',
    triggerValue: 85,
    persistenceMinutes: 120,
    clearOp: 'lt',
    clearValue: 80,
    clearMinutes: 30,
    timeGate: 'Night',
    rationale: 'Elevated disease pressure',
  },
  // 6. VPD Warning: VPD < 0.2, P 60m, H VPD > 0.3 for 20m, Any
  {
    type: 'single',
    ruleKey: 'vpd_low',
    severity: AlertSeverity.CRITICAL,
    parameter: 'VPD (kPa)',
    field: INFLUX_FIELDS.vpd,
    triggerOp: 'lt',
    triggerValue: 0.2,
    persistenceMinutes: 60,
    clearOp: 'gt',
    clearValue: 0.3,
    clearMinutes: 20,
    timeGate: 'Any',
    rationale: 'Saturated air',
  },
  // 7. VPD Warning: VPD > 2.4, P 30m, H VPD < 1.3 for 20m, Day
  {
    type: 'single',
    ruleKey: 'vpd_high',
    severity: AlertSeverity.CRITICAL,
    parameter: 'VPD (kPa)',
    field: INFLUX_FIELDS.vpd,
    triggerOp: 'gt',
    triggerValue: 2.4,
    persistenceMinutes: 30,
    clearOp: 'lt',
    clearValue: 1.3,
    clearMinutes: 20,
    timeGate: 'Day',
    rationale: 'Excess transpiration stress',
  },
  // 8. Composite: VPD > 2.3 AND VWC < 0.20, P 30m, H VPD < 2.0 OR VWC > 0.23 for 20m, Day
  {
    type: 'composite',
    ruleKey: 'vpd_vwc_atmospheric_demand',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Atmospheric demand vs irrigation',
    fieldA: INFLUX_FIELDS.vpd,
    opA: 'gt',
    valueA: 2.3,
    fieldB: INFLUX_FIELDS.vwc,
    opB: 'lt',
    valueB: 0.2,
    persistenceMinutes: 30,
    clearOpA: 'lt',
    clearValueA: 2.0,
    clearOpB: 'gt',
    clearValueB: 0.23,
    clearMinutes: 20,
    timeGate: 'Day',
    rationale:
      'Only triggers when air demand is high and root zone trending dry',
  },
  // 9. Composite delta: VPD > 2.3 AND VWC drop > 0.05 in 30m, Immediate, H absent 60m, Day
  {
    type: 'delta',
    ruleKey: 'vwc_rapid_drydown',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Rapid dry-down under high VPD',
    field: INFLUX_FIELDS.vwc,
    direction: 'drop',
    threshold: 0.05,
    windowMinutes: 30,
    clearMinutes: 60,
    timeGate: 'Day',
    rationale: 'Catches missed irrigation / clogged line',
  },
  // 10. DLI: PAR > 20 mol/m2/day, P 20m, H > 70% median 20m — simplified as single PAR > 20
  {
    type: 'single',
    ruleKey: 'par_high',
    severity: AlertSeverity.CRITICAL,
    parameter: 'DLI',
    field: INFLUX_FIELDS.par,
    triggerOp: 'gt',
    triggerValue: 20,
    persistenceMinutes: 20,
    clearOp: 'lt',
    clearValue: 14, // 70% of 20
    clearMinutes: 20,
    timeGate: { start: '10:00', end: '14:00' },
    rationale: 'Shade/screen issue',
  },
  // 11. VWC Critical: VWC < 0.15, P 15m, H VWC > 0.20 for 15m, Day
  {
    type: 'single',
    ruleKey: 'vwc_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'VWC',
    field: INFLUX_FIELDS.vwc,
    triggerOp: 'lt',
    triggerValue: 0.15,
    persistenceMinutes: 15,
    clearOp: 'gt',
    clearValue: 0.2,
    clearMinutes: 15,
    timeGate: 'Day',
    rationale: 'Missed irrigation / blockage',
  },
  // 12. VWC Warning: VWC < 0.20, P 60m, H VWC > 0.23 for 20m, Day
  {
    type: 'single',
    ruleKey: 'vwc_warning',
    severity: AlertSeverity.CRITICAL,
    parameter: 'VWC',
    field: INFLUX_FIELDS.vwc,
    triggerOp: 'lt',
    triggerValue: 0.2,
    persistenceMinutes: 60,
    clearOp: 'gt',
    clearValue: 0.23,
    clearMinutes: 20,
    timeGate: 'Day',
    rationale: 'Chronic water stress',
  },
  // 13. VWC Δ Critical: drop > 0.05 in 30m, Immediate, H stabilized 30m, Day
  {
    type: 'delta',
    ruleKey: 'vwc_drop_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'VWC Δ',
    field: INFLUX_FIELDS.vwc,
    direction: 'drop',
    threshold: 0.05,
    windowMinutes: 30,
    clearMinutes: 30,
    timeGate: 'Day',
    rationale: 'Irrigation malfunction',
  },
  // 14. EC Critical: EC > 4.0, P 30m, H EC < 3.5 for 60m, Any
  {
    type: 'single',
    ruleKey: 'ec_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'EC (mS/cm)',
    field: INFLUX_FIELDS.ec,
    triggerOp: 'gt',
    triggerValue: 4.0,
    persistenceMinutes: 30,
    clearOp: 'lt',
    clearValue: 3.5,
    clearMinutes: 60,
    timeGate: 'Any',
    rationale: 'Salinity damage risk',
  },
  // 15. EC Warning: EC > 3.0, P 4h, H EC < 2.8 for 2h, Any
  {
    type: 'single',
    ruleKey: 'ec_warning',
    severity: AlertSeverity.CRITICAL,
    parameter: 'EC (mS/cm)',
    field: INFLUX_FIELDS.ec,
    triggerOp: 'gt',
    triggerValue: 3.0,
    persistenceMinutes: 240,
    clearOp: 'lt',
    clearValue: 2.8,
    clearMinutes: 120,
    timeGate: 'Any',
    rationale: 'Yield loss zone',
  },
  // 16. EC Δ Critical: increase > 1.0 in 6h, Immediate, H stabilized 6h, Any
  {
    type: 'delta',
    ruleKey: 'ec_increase_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'EC Δ',
    field: INFLUX_FIELDS.ec,
    direction: 'increase',
    threshold: 1.0,
    windowMinutes: 360,
    clearMinutes: 360,
    timeGate: 'Any',
    rationale: 'Fertigation error',
  },
  // 17. Root Temp Critical: T > 28, P 60m, H T < 26 for 30m, Day
  {
    type: 'single',
    ruleKey: 'root_temp_critical',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Root Temp (°C)',
    field: INFLUX_FIELDS.rootTemp,
    triggerOp: 'gt',
    triggerValue: 28,
    persistenceMinutes: 60,
    clearOp: 'lt',
    clearValue: 26,
    clearMinutes: 30,
    timeGate: 'Day',
    rationale: 'Root oxygen/function stress',
  },
  // 18. Root Temp Warning: T > 25, P 4h, H T < 24 for 2h, Day
  {
    type: 'single',
    ruleKey: 'root_temp_warning',
    severity: AlertSeverity.CRITICAL,
    parameter: 'Root Temp (°C)',
    field: INFLUX_FIELDS.rootTemp,
    triggerOp: 'gt',
    triggerValue: 25,
    persistenceMinutes: 240,
    clearOp: 'lt',
    clearValue: 24,
    clearMinutes: 120,
    timeGate: 'Day',
    rationale: 'Chronic productivity drag',
  },
];

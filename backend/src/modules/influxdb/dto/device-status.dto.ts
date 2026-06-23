import {
  Field,
  Float,
  Int,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Relative look-back windows for the device-status dashboard. Each maps to a
 * Flux range duration (see `DEVICE_STATUS_RANGE_FLUX`) — one per UI preset.
 */
export enum DeviceStatusRange {
  ONE_DAY = 'ONE_DAY',
  SEVEN_DAYS = 'SEVEN_DAYS',
  ONE_MONTH = 'ONE_MONTH',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
}

registerEnumType(DeviceStatusRange, {
  name: 'DeviceStatusRange',
  description: 'Relative look-back window for device status queries',
});

/** Flux `range(start:)` duration per preset. */
export const DEVICE_STATUS_RANGE_FLUX: Record<DeviceStatusRange, string> = {
  [DeviceStatusRange.ONE_DAY]: '-1d',
  [DeviceStatusRange.SEVEN_DAYS]: '-7d',
  [DeviceStatusRange.ONE_MONTH]: '-30d',
  [DeviceStatusRange.SIX_MONTHS]: '-180d',
  [DeviceStatusRange.ONE_YEAR]: '-365d',
};

/**
 * `aggregateWindow(every:)` bucket size for the data-points-over-time chart,
 * chosen per range so the series stays a readable number of points.
 */
export const DEVICE_STATUS_RANGE_WINDOW: Record<DeviceStatusRange, string> = {
  [DeviceStatusRange.ONE_DAY]: '1h',
  [DeviceStatusRange.SEVEN_DAYS]: '6h',
  [DeviceStatusRange.ONE_MONTH]: '1d',
  [DeviceStatusRange.SIX_MONTHS]: '1w',
  [DeviceStatusRange.ONE_YEAR]: '1w',
};

@InputType()
export class DeviceStatusInput {
  @Field(() => DeviceStatusRange, {
    defaultValue: DeviceStatusRange.SEVEN_DAYS,
  })
  @IsOptional()
  @IsEnum(DeviceStatusRange)
  range?: DeviceStatusRange;

  /**
   * Custom absolute range start (ISO 8601). When both `start` and `stop` are
   * set they take precedence over `range`.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  start?: string;

  /** Custom absolute range stop (ISO 8601). Paired with `start`. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stop?: string;

  /** VGreens-admin override; ignored for tenant users (scoped to their tenant). */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

/**
 * Picks a readable `aggregateWindow` bucket for a custom range based on its
 * duration in milliseconds (mirrors `DEVICE_STATUS_RANGE_WINDOW`).
 */
export function windowForDurationMs(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours <= 48) return '1h';
  if (hours <= 24 * 14) return '6h';
  if (hours <= 24 * 60) return '1d';
  return '1w';
}

/** Latest reading of a single field for a device (e.g. `temperature` = 21.3). */
@ObjectType()
export class DeviceFieldValue {
  @Field()
  field: string;

  @Field(() => Float)
  value: number;

  @Field(() => Date)
  time: Date;
}

/**
 * Per-device liveness/inventory row, mirroring `message_inventory.py`:
 *  - `state`        working | stale | heartbeat-only | never-seen
 *  - `lastAlive`    last uplink (from the server-side `system` monitor)
 *  - `lastRealData` last actual sensor payload (non-`system` measurement)
 * Settings (`greenhouse`/`xPosition`/…) are merged in from `SensorConfig`.
 */
@ObjectType()
export class DeviceStatus {
  @Field()
  device: string;

  @Field()
  state: string;

  /** `edge` (vgreens-XX-XX, ~3x/day) vs `regular` (Air_/Soil_, ~5 min). */
  @Field()
  deviceClass: string;

  /** All measurement types reported (short form, e.g. `leaftom`, `system`). */
  @Field(() => [String])
  messageTypes: string[];

  /** Non-`system` measurement types only (actual sensor data). */
  @Field(() => [String])
  realMessageTypes: string[];

  @Field({ nullable: true })
  online?: boolean;

  @Field(() => Date, { nullable: true })
  lastAlive?: Date;

  @Field(() => Date, { nullable: true })
  lastRealData?: Date;

  @Field(() => Int)
  realDataPoints: number;

  @Field(() => Int)
  heartbeatDataPoints: number;

  /** Latest value of each real (non-`system`) field, newest reading per field. */
  @Field(() => [DeviceFieldValue])
  lastValues: DeviceFieldValue[];

  // --- Merged SensorConfig settings (nullable when the device is unconfigured) ---

  @Field({ nullable: true })
  greenhouse?: string;

  @Field(() => Float, { nullable: true })
  xPosition?: number;

  @Field(() => Float, { nullable: true })
  yPosition?: number;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  hiddenInFarmOverview?: boolean;
}

/** One bucketed count of real (non-`system`) data points over time. */
@ObjectType()
export class DeviceActivityPoint {
  @Field(() => Date)
  time: Date;

  @Field(() => Int)
  count: number;
}

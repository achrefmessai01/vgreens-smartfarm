import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class GetFieldMeansInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  @Field(() => Int, { defaultValue: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  windowMinutes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  greenhouse?: string;

  /**
   * Absolute range start (ISO 8601). When both `start` and `stop` are
   * provided, they take precedence over `windowMinutes`.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  start?: string;

  /** Absolute range stop (ISO 8601). Paired with `start`. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stop?: string;
}

@ObjectType()
export class FieldMeanMetric {
  @Field()
  field: string;

  @Field({ nullable: true })
  greenhouse?: string;

  /**
   * Some tenants tag their location with `chamber` instead of `greenhouse`
   * (see `farm-data-live.ts`). The Flux query groups by both, so exactly
   * one of `greenhouse` / `chamber` is set on each row.
   */
  @Field({ nullable: true })
  chamber?: string;

  @Field(() => Date)
  time: Date;

  @Field()
  value: number;

  /**
   * Pre-correction reading. Set only when a tenant-specific correction was
   * applied to `value` (see `air-temperature-correction.ts`).
   */
  @Field({ nullable: true })
  rawValue?: number;
}

@InputType()
export class GetParDliTodayInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  /**
   * IANA timezone name (e.g. "Europe/Berlin"). Used to align today's
   * window and the historical band's hour buckets to the viewer's local
   * time. Falls back to UTC when omitted.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;
}

@ObjectType()
export class ParDliPoint {
  @Field(() => Date)
  time: Date;

  @Field()
  dli: number;
}

/**
 * One hourly point on the historical DLI band. `hour` is the local hour
 * (0–23) in the requesting client's timezone. `dli` is null when the
 * hour has no samples on any of the lookback days, signalling the chart
 * to render a gap rather than zero.
 */
@ObjectType()
export class ParDliBandPoint {
  @Field(() => Int)
  hour: number;

  @Field({ nullable: true })
  dli?: number;
}

@ObjectType()
export class ParDliResult {
  /** Latest PPFD reading in µmol m⁻² s⁻¹ (mean lux of the last 5-minute window / 55). */
  @Field({ nullable: true })
  currentPPFD?: number;

  /** Latest cumulative DLI value for today in mol m⁻². */
  @Field({ nullable: true })
  currentDLI?: number;

  /** Cumulative DLI curve for today, one point per 5-minute window. */
  @Field(() => [ParDliPoint])
  todaysGraphData: ParDliPoint[];

  /**
   * Historical band lower edge: cumulative DLI built from the per-hour
   * mean (across the last 14 days) of each day's hourly **minimum** lux.
   * 24 points, one per hour starting at today's UTC midnight.
   */
  @Field(() => [ParDliBandPoint])
  lowerEdge: ParDliBandPoint[];

  /**
   * Historical band upper edge: cumulative DLI built from the per-hour
   * mean of each day's hourly **maximum** lux. Same shape as `lowerEdge`.
   */
  @Field(() => [ParDliBandPoint])
  upperEdge: ParDliBandPoint[];
}

import { Field, ObjectType } from '@nestjs/graphql';
import { ParDliResult } from '@modules/influxdb/dto';

@ObjectType()
export class GreenhouseParDli {
  /** Greenhouse name as defined on the tenant's `greenhouses` JSONB blob. */
  @Field()
  name: string;

  @Field(() => ParDliResult)
  data: ParDliResult;
}

@ObjectType()
export class TenantParDli {
  /**
   * Combined PAR/DLI across all sensors that participate in this tenant's
   * view. For tenants with a configured sensor→greenhouse mapping this is
   * the union of mapped sensors only (sensors without a mapping — e.g. sky
   * reference devices — are intentionally excluded). For tenants without
   * any mapping this is every lux sensor in the bucket (fallback).
   */
  @Field(() => ParDliResult)
  combined: ParDliResult;

  /**
   * Per-greenhouse PAR/DLI breakdown. Empty when the tenant has no
   * `sensor_configs` mapping yet — the empty array is the explicit signal
   * that only the combined view is meaningful.
   */
  @Field(() => [GreenhouseParDli])
  greenhouses: GreenhouseParDli[];
}

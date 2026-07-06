import { Field, ObjectType } from '@nestjs/graphql';

/**
 * A device present in the tenant's InfluxDB bucket, paired with the device
 * profile it last reported via the `profile` tag. `profile` is null for
 * devices whose points carry no profile tag (e.g. older data).
 */
@ObjectType()
export class SensorDevice {
  @Field()
  device: string;

  @Field({ nullable: true })
  profile?: string;
}

import { Field, Float, ObjectType } from '@nestjs/graphql';

/**
 * A single real sensor reading surfaced during calibration capture. Returned by
 * the `calibrationReading` polling query so the UI can detect the first genuine
 * transmission after the operator presses calibrate.
 */
@ObjectType()
export class CalibrationReading {
  @Field(() => Float)
  value: number;

  /** ISO timestamp of the datapoint. */
  @Field()
  time: string;
}

import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { HarvestQualityClass } from '@common/enums';

// Shape of a single sub-entry stored inside the Harvest.entries jsonb column.
// One "Log Harvest" submission can hold several of these — each carries its own
// yield, brix and fruit-weight measurement. It is NOT a TypeORM entity: it only
// describes the GraphQL type for the jsonb array elements. Date and photos stay
// at the harvest level and so are intentionally absent here.
@ObjectType()
export class HarvestEntry {
  @Field(() => Float)
  classA: number;

  @Field(() => Float)
  classB: number;

  @Field(() => Float)
  classC: number;

  @Field(() => Float)
  waste: number;

  @Field(() => Float)
  rowX: number;

  @Field(() => Float)
  rowY: number;

  @Field(() => Float)
  avgBrix: number;

  @Field(() => [Float])
  brixReadings: number[];

  // Quality grade each Brix reading belongs to, aligned by index with
  // brixReadings (brixClasses[i] is the grade of brixReadings[i]).
  @Field(() => [HarvestQualityClass])
  brixClasses: HarvestQualityClass[];

  @Field(() => Int)
  fruitCount: number;

  @Field(() => Float)
  totalFruitWeight: number;

  @Field(() => Float)
  avgFruitWeight: number;
}

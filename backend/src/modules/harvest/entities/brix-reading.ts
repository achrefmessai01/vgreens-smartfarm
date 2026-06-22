import { ObjectType, InputType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { HarvestQualityClass } from '@common/enums';

// A single Brix measurement and the saleable grade it belongs to. Replaces the
// old pair of index-aligned parallel arrays (brixReadings[] + brixClasses[]):
// the two are now merged into one object per reading.
@ObjectType('BrixReading')
@InputType('BrixReadingInput')
export class BrixReading {
  @Field(() => HarvestQualityClass)
  @IsEnum(HarvestQualityClass)
  class: HarvestQualityClass;

  @Field(() => Float)
  @IsNumber()
  value: number;
}

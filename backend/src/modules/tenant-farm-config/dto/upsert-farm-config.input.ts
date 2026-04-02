import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, IsOptional } from 'class-validator';

@InputType()
export class UpsertFarmConfigInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  bayCount?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  polesMax?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  chambersCount?: number;
}

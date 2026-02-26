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
}

@ObjectType()
export class FieldMeanMetric {
  @Field()
  field: string;

  @Field({ nullable: true })
  greenhouse?: string;

  @Field(() => Date)
  time: Date;

  @Field()
  value: number;
}

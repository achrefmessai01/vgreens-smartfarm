import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class GetBucketDataInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  start?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stop?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  field?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  greenhouse?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  device?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  level?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  useLastPerSeries?: boolean;
}

import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class InfluxDBData {
  @Field(() => GraphQLJSONObject)
  data: Record<string, unknown>;
}

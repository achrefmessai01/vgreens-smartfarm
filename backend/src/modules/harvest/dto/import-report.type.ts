import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RowIssueType {
  @Field(() => Int)
  sourceRow!: number;

  /** 'error' | 'warning' */
  @Field()
  level!: string;

  @Field()
  reason!: string;
}

@ObjectType()
export class ImportReportType {
  @Field()
  tenant!: string;

  @Field()
  tenantId!: string;

  @Field()
  file!: string;

  @Field()
  mapper!: string;

  @Field()
  dryRun!: boolean;

  @Field()
  startedAt!: string;

  @Field()
  finishedAt!: string;

  @Field(() => Int)
  totalRows!: number;

  @Field(() => Int)
  validRows!: number;

  @Field(() => Int)
  invalidRows!: number;

  @Field(() => Int)
  created!: number;

  @Field(() => Int)
  skippedDuplicates!: number;

  @Field(() => Int)
  failed!: number;

  @Field(() => [RowIssueType])
  issues!: RowIssueType[];

  @Field(() => [String])
  globalWarnings!: string[];
}

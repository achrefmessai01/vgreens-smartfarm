import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsUUID, IsDefined } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class ImportHarvestInput {
  @Field(() => GraphQLUpload, { description: 'XLS/XLSX/CSV file.' })
  @IsDefined()
  file!: Promise<FileUpload>;

  @Field(() => Boolean, { nullable: true, description: 'Validate only, no writes. Defaults to true.' })
  @IsBoolean()
  @IsOptional()
  dryRun?: boolean | null;

  @Field(() => ID, { nullable: true, description: 'Target tenant — required for superadmin, ignored otherwise.' })
  @IsUUID()
  @IsOptional()
  tenantId?: string | null;
}

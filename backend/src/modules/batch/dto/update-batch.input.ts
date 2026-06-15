import { InputType, PartialType, OmitType } from '@nestjs/graphql';
import { CreateBatchInput } from './create-batch.input';

// All fields optional on update; tenantId is fixed at creation.
@InputType()
export class UpdateBatchInput extends PartialType(
  OmitType(CreateBatchInput, ['tenantId'] as const),
) {}

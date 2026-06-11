import { InputType, PartialType, OmitType } from '@nestjs/graphql';
import { CreateGreenhouseInput } from './create-greenhouse.input';

// All fields optional on update; tenantId is fixed at creation and not editable.
@InputType()
export class UpdateGreenhouseInput extends PartialType(
  OmitType(CreateGreenhouseInput, ['tenantId'] as const),
) {}

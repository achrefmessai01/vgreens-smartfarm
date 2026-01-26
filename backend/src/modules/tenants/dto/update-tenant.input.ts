import { InputType, PartialType } from '@nestjs/graphql';
import { CreateTenantInput } from './create-tenant.input';

@InputType()
export class UpdateTenantInput extends PartialType(CreateTenantInput) {}

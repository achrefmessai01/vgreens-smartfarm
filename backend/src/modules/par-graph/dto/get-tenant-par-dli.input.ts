import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class GetTenantParDliInput {
  /**
   * Only honoured for `VGREENS_ADMIN` callers viewing another tenant.
   * Tenant-scoped users always resolve to their own tenant id.
   */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  /**
   * IANA timezone name (e.g. "Europe/Berlin"). Used to align today's
   * window and the historical band's hour buckets to the viewer's local
   * time. Falls back to UTC when omitted.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;
}

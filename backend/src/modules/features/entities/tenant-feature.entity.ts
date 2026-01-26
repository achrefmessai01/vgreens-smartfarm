import { Feature } from './feature.entity';
import { BaseEntity } from '@common/entities';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@ObjectType()
@Entity('tenant_features')
@Unique(['tenantId', 'featureId'])
export class TenantFeature extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.tenantFeatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  featureId: string;

  @Field(() => Feature, { nullable: true })
  @ManyToOne(() => Feature, (feature) => feature.tenantFeatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'featureId' })
  feature?: Feature;

  @Field()
  @Column({ type: 'boolean', default: false })
  enabled: boolean; // Whether this feature is enabled for this tenant

  // Config is stored in database but not exposed in GraphQL schema
  // Use tenantFeatures query to access config if needed
  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>; // Feature-specific configuration

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

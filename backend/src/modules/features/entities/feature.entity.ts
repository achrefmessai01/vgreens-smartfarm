import { BaseEntity } from '@common/entities';
import { Entity, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TenantFeature } from './tenant-feature.entity';

@ObjectType()
@Entity('features')
export class Feature extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  key: string; // e.g., 'camera_livestream', 'sensor_alerts', 'automated_irrigation'

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string; // Display name

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string; // e.g., 'monitoring', 'automation', 'analytics'

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Whether this feature is available in the system

  @Field(() => [TenantFeature], { nullable: true })
  @OneToMany(() => TenantFeature, (tenantFeature) => tenantFeature.feature)
  tenantFeatures?: TenantFeature[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

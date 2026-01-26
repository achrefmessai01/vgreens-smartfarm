import { BaseEntity } from '@common/entities';
import { Entity, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { TenantFeature } from '@modules/features/entities/tenant-feature.entity';

@ObjectType()
@Entity('tenants')
export class Tenant extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @Field(() => [TenantFeature], { nullable: true })
  @OneToMany(() => TenantFeature, (tenantFeature) => tenantFeature.tenant)
  tenantFeatures?: TenantFeature[];

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  influxBucketName?: string;

  @Field(() => ID, { nullable: true })
  tenantId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

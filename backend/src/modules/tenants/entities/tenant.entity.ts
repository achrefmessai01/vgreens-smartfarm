import { DoorPosition } from '@/common/enums/door-position.enum';
import { BaseEntity } from '@common/entities';
import { TenantFeature } from '@modules/features/entities/tenant-feature.entity';
import { User } from '@modules/users/entities/user.entity';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';

@ObjectType()
export class TenantGreenhouse {
  @Field()
  name: string;

  @Field(() => DoorPosition, { nullable: true })
  doorPosition?: DoorPosition;

  @Field()
  xDimension: number;

  @Field()
  yDimension: number;

  @Field(() => Int, { nullable: true })
  bayCount?: number;
}

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

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone?: string;

  @Field(() => ID, { nullable: true })
  tenantId?: string;

  @Field(() => [TenantGreenhouse], { nullable: true })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  greenhouses: TenantGreenhouse[];

  @Field(() => [String], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  disabledSensorFields: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

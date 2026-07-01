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

  @Field(() => Boolean, { nullable: true })
  isHorizontal?: boolean;

  // Surfaces the underlying Greenhouse flag through the Tenant.greenhouses
  // resolve field so Farm Overview can hide tabs without an extra query.
  @Field(() => Boolean, { nullable: true })
  hiddenInFarmOverview?: boolean;
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

  // `greenhouses` is no longer stored on the tenant. It is a resolve field on
  // TenantsResolver backed by the dedicated `greenhouses` table (the single
  // source of truth). The TenantGreenhouse ObjectType above is the exposed shape.

  @Field(() => [String], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  disabledSensorFields: string[];

  @Field(() => [String], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  hiddenHarvestDashboardItems: string[];

  // Per-tenant display order for the harvest dashboard, stored as an ordered
  // list of item ids (mixing metric + chart ids). Empty = no custom order, so
  // the frontend falls back to the registry order. Ids not present here fall
  // to the end in registry order, so newly added items surface without a
  // migration. Reordering is scoped per grid on the client; both grids share
  // this single list and each filters to its own ids.
  @Field(() => [String], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  harvestDashboardOrder: string[];

  // Whitelist of email domains (e.g. ["v-greens.com", "example.org"]) allowed
  // when adding/moving users into this tenant. Empty list = unrestricted (any
  // domain accepted). Stored as a normalized lowercase list; the service
  // enforces format + uniqueness so the column never holds duplicates.
  @Field(() => [String], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  allowedDomains: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

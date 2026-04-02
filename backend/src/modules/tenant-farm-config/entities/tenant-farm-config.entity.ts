import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@common/entities';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@ObjectType()
@Entity('tenant_farm_configs')
@Unique(['tenantId'])
export class TenantFarmConfig extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => Int)
  @Column({ type: 'int', default: 13 })
  bayCount: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 10 })
  polesMax: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 2 })
  chambersCount: number;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

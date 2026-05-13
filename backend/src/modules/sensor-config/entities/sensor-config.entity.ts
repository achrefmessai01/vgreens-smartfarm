import { BaseEntity } from '@common/entities';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('sensor_configs')
@Unique(['tenantId', 'device'])
export class SensorConfig extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field()
  @Column({ type: 'varchar', length: 128 })
  device: string;

  @Field({ nullable: true })
  @Column({ type: 'float', default: 0, nullable: true })
  xPosition?: number;

  @Field({ nullable: true })
  @Column({ type: 'float', default: 0, nullable: true })
  yPosition?: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  greenhouse?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  city?: string;

  @Field({ nullable: true })
  @Column({ type: 'boolean', default: false, nullable: true })
  hiddenInFarmOverview?: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

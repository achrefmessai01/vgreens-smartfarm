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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

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
  @Column({ type: 'varchar', length: 64, nullable: true })
  bay?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  pole?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  row?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  greenhouse?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  city?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

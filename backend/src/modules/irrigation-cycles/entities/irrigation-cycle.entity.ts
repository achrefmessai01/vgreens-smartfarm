import { BaseEntity } from '@common/entities';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tenant-scoped irrigation cycle metadata.
 *
 * The soil-moisture calibration reference readings that this table historically
 * carried now live on `sensor_configs` (calibration is per physical sensor, not
 * per cycle), so only the cycle metadata remains here. See the
 * CreateIrrigationCycles migration.
 */
@ObjectType()
@Entity('irrigation_cycles')
export class IrrigationCycle extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Index('idx_irrigation_cycles_tenant')
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  greenhouseId?: string | null;

  @ManyToOne(() => Greenhouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'greenhouseId' })
  greenhouseRef?: Greenhouse | null;

  @Field()
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

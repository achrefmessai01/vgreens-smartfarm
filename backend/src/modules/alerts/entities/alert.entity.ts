import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '@common/entities';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AlertSeverity, AlertStatus } from '@common/enums';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@ObjectType()
@Entity('alerts')
export class Alert extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  tunnelId?: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  sensorName: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Field(() => AlertStatus)
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.OPEN,
  })
  status: AlertStatus;

  @Field(() => AlertSeverity)
  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.CRITICAL,
  })
  severity: AlertSeverity;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  timestamp?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

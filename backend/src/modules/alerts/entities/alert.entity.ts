import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { AlertSeverity, AlertStatus } from '@common/enums';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@ObjectType()
@Entity('alerts')
// Composite indexes covering the hot query patterns:
//   - The list view: WHERE tenantId = ? ORDER BY timestamp DESC
//   - Status filters: WHERE tenantId = ? AND status = ?
//   - Open-alert lookups by sensor (used by the alert generation cron):
//     WHERE tenantId = ? AND sensorName = ? AND status = 'OPEN'
@Index('idx_alerts_tenant_timestamp', ['tenantId', 'timestamp'])
@Index('idx_alerts_tenant_status', ['tenantId', 'status'])
@Index('idx_alerts_tenant_sensor_status', ['tenantId', 'sensorName', 'status'])
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
  @Column({ type: 'varchar', length: 64, nullable: true })
  ruleKey?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  timestamp?: Date;

  /** InfluxDB _field (e.g. temperature, humidity) */
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  field?: string;

  /** InfluxDB _measurement (e.g. air_quality) */
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  measurement?: string;

  /** InfluxDB device tag (e.g. Air_04) */
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  device?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  greenhouse?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  city?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 32, nullable: true })
  column?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 32, nullable: true })
  row?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  profile?: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  acknowledgedById?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acknowledgedById' })
  acknowledgedBy?: User;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  acknowledgedTime?: Date;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  resolvedById?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolvedById' })
  resolvedBy?: User;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  resolvedTime?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

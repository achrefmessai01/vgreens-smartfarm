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
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '@modules/users/entities/user.entity';
import { ReportSeverity, ErrorSource, ErrorType } from '@common/enums';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@ObjectType()
@Entity('system_errors')
@Index(['source', 'errorType', 'severity'])
@Index(['createdAt'])
@Index(['isResolved', 'severity'])
export class SystemError extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Field(() => ErrorSource)
  @Column({
    type: 'enum',
    enum: ErrorSource,
  })
  source: ErrorSource;

  @Field(() => ErrorType)
  @Column({
    type: 'enum',
    enum: ErrorType,
    default: ErrorType.UNKNOWN_ERROR,
  })
  errorType: ErrorType;

  @Field(() => ReportSeverity)
  @Column({
    type: 'enum',
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity: ReportSeverity;

  @Field()
  @Column({ type: 'varchar', length: 500 })
  errorMessage: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  requestUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  httpMethod?: string;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  httpStatusCode?: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  component?: string; // Frontend component or backend module name

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  action?: string; // What action was being performed

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // Additional context data

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'json', nullable: true })
  requestPayload?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  resolvedBy?: string;

  @Field({ nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolvedBy' })
  resolver?: User;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Field({ nullable: true })
  @Column({ type: 'int', default: 1 })
  occurrenceCount: number; // Track how many times this exact error occurred

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastOccurredAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'boolean', default: false })
  isNotified: boolean; // Track if alerts were sent

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  errorHash?: string; // Hash of error message + stack trace for deduplication

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

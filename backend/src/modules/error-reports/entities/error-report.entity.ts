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
import { User } from '@modules/users/entities/user.entity';
import { ReportSeverity } from '@common/enums';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@ObjectType()
@Entity('error_reports')
export class ErrorReport extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  userEmail: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  errorTitle: string;

  @Field()
  @Column({ type: 'text' })
  errorDetails: string;

  @Field(() => ReportSeverity)
  @Column({
    type: 'enum',
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity: ReportSeverity;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reproductionSteps?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  expectedVsActual?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  browserInfo?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', nullable: true })
  attachments?: string; // JSON stringified array of attachment URLs

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

  @Field({ nullable: true })
  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  resolvedBy?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolvedBy' })
  resolvedByUser?: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
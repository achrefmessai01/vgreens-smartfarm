import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { BatchStatus } from '@common/enums';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';

// Keep date columns as plain YYYY-MM-DD strings on the way in/out so a planting
// date never shifts across timezones (mirrors the old harvest dateTransformer).
const dateTransformer: ValueTransformer = {
  to: (value: Date | string) =>
    typeof value === 'string' ? value : value?.toISOString?.().split('T')[0],
  from: (value: string | Date | null) =>
    value == null ? value : typeof value === 'string' ? new Date(value) : value,
};

// Planting-level data split out of the old denormalized harvests table. A batch
// owns many harvests (harvest events). species/variety stay free text this phase
// (they become FKs to crops/varieties later).
@ObjectType()
@Entity('batches')
export class Batch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
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
  greenhouseId?: string | null;

  @Field(() => Greenhouse, { nullable: true })
  @ManyToOne(() => Greenhouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'greenhouseId' })
  greenhouse?: Greenhouse | null;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User | null;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  species?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  variety?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  batchNumber?: string;

  @Field(() => BatchStatus)
  @Column({
    type: 'enum',
    enum: BatchStatus,
    enumName: 'batches_status_enum',
    default: BatchStatus.ACTIVE,
  })
  status: BatchStatus;

  @Field()
  @Column({ type: 'date', transformer: dateTransformer })
  plantingDate: Date;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  numberOfRows: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  rowLength: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  rowSpacing: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  plantsPerMeter: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  lostPlants: number;

  // Backend-filled (cultivationArea ≈ numberOfRows * rowLength * rowSpacing-ish)
  // but user-overridable per the schema comment.
  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  cultivationArea: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  totalPlants: number;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  deletedById?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deletedById' })
  deletedBy?: User | null;
}

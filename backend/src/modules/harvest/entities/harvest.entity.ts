import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Batch } from '@modules/batch/entities/batch.entity';
import { Crate } from '@modules/crate/entities/crate.entity';
import { HarvestEntry } from './harvest-entry.entity';
import { HarvestTotals } from '../dto/harvest-totals.dto';

const dateTransformer: ValueTransformer = {
  to: (value: Date | string) =>
    typeof value === 'string' ? value : value?.toISOString?.().split('T')[0],
  from: (value: string | Date | null) =>
    value == null ? value : typeof value === 'string' ? new Date(value) : value,
};

// The harvest event only. All measurements live in harvest_entries; all totals
// (classKgs, yields, etc.) are derived by HarvestService and exposed via the
// resolved `totals` field — they are never stored on this row. Planting data
// lives on the parent batch.
@ObjectType()
@Entity('harvests')
export class Harvest {
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

  @Field(() => ID)
  @Column({ type: 'uuid' })
  batchId: string;

  @Field(() => Batch, { nullable: true })
  @ManyToOne(() => Batch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch?: Batch;

  // The crate this harvest was recorded with, for crate-mode batches. Supersedes
  // the live read off batch.crateWeight: crate-mode weight derivation reads the
  // crate's weight, so a harvest is pinned to the crate size it was logged with.
  // Null for weight-mode harvests (and any legacy crate harvest not yet
  // repointed). onDelete RESTRICT can't fire — crates are only ever soft-deleted.
  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  crateId?: string | null;

  @Field(() => Crate, { nullable: true })
  @ManyToOne(() => Crate, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'crateId' })
  crate?: Crate | null;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User | null;

  @Field()
  @Column({ type: 'date', transformer: dateTransformer })
  date: Date;

  // Session timing + labor for the whole harvest, shared by all entries. Times
  // are wall-clock time-of-day (local zone), stored as Postgres `time` and read
  // back as 'HH:mm:ss' strings. All nullable: existing harvests have no values
  // and are not backfilled. The service enforces stopTime > startTime and the
  // both-or-neither rule; headcount is a positive integer.
  @Field(() => String, { nullable: true })
  @Column({ type: 'time', nullable: true })
  startTime?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'time', nullable: true })
  stopTime?: string | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  harvesterHeadCount?: number | null;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: () => "'[]'" })
  photoUrls: string[];

  @Field(() => [HarvestEntry])
  @OneToMany(() => HarvestEntry, (entry) => entry.harvest, {
    cascade: true,
  })
  entries?: HarvestEntry[];

  // Service-computed aggregate of this harvest's entries. Exposed in GraphQL via
  // the resolver's @ResolveField('totals') (NOT decorated here, to avoid a
  // duplicate field), and populated as a plain property for the CSV export.
  // Replaces what the omitted DB view would have produced.
  totals?: HarvestTotals;

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

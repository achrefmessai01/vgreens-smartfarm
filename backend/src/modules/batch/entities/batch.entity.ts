import {
  Entity,
  Index,
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
import { BatchStatus, InputMode } from '@common/enums';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Variety } from '@modules/variety/entities/variety.entity';

// Keep date columns as plain YYYY-MM-DD strings on the way in/out so a planting
// date never shifts across timezones (mirrors the old harvest dateTransformer).
const dateTransformer: ValueTransformer = {
  to: (value: Date | string) =>
    typeof value === 'string' ? value : value?.toISOString?.().split('T')[0],
  from: (value: string | Date | null) =>
    value == null ? value : typeof value === 'string' ? new Date(value) : value,
};

// Planting-level data split out of the old denormalized harvests table. A batch
// owns many harvests (harvest events). species/variety are now FKs into the
// global crops/varieties catalog (cropId required, varietyId optional).
@ObjectType()
@Entity('batches')
@Index('idx_batches_crop', ['cropId'])
@Index('idx_batches_variety', ['varietyId'])
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

  @Field(() => ID)
  @Column({ type: 'uuid' })
  cropId: string;

  @Field(() => Crop, { nullable: true })
  @ManyToOne(() => Crop)
  @JoinColumn({ name: 'cropId' })
  crop?: Crop;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  varietyId?: string | null;

  @Field(() => Variety, { nullable: true })
  @ManyToOne(() => Variety, { nullable: true })
  @JoinColumn({ name: 'varietyId' })
  variety?: Variety | null;

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

  // How this batch's harvests record yield. Fixed at creation. In crate mode,
  // entries store per-quality crate counts + a remainder and the kg/total are
  // derived from crateWeight at read time (so editing crateWeight propagates).
  @Field(() => InputMode)
  @Column({
    type: 'enum',
    enum: InputMode,
    enumName: 'batches_input_mode_enum',
    default: InputMode.WEIGHT,
  })
  inputMode: InputMode;

  // Weight of one crate (kg) for crate-mode batches. Editable; the change
  // intentionally propagates to every crate-mode entry's derived yield. Null
  // for weight-mode batches. Never snapshotted onto entries.
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  crateWeight?: number | null;

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

  // Running meters: the batch's total cultivated row length in metres, i.e.
  // numberOfRows × rowLength. Derived from the two stored fields (not a column)
  // so it can never drift out of sync when either changes; 0 when either factor
  // is 0/missing. Distinct from rowLength, which is the length of a single row.
  @Field(() => Float, {
    description:
      'Running meters: numberOfRows × rowLength (m). Total cultivated row length across all rows of the batch. 0 when either factor is 0.',
  })
  get runningMeter(): number {
    return (this.numberOfRows ?? 0) * (this.rowLength ?? 0);
  }

  // The contiguous block of physical rows this batch occupies, as start/end row
  // numbers (inclusive). Nullable: existing batches are backfilled by hand and
  // a batch without a defined range falls back to unconstrained harvest rows.
  // Float to match the harvest entry rowX/rowY representation so batch bounds
  // and per-harvest positions live in the same numeric domain.
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  startRow?: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  endRow?: number | null;

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

  // Number of replicate samples taken per harvest for this batch. Drives how
  // many sets of inputs the harvest entry form renders. Defaults to 1 so
  // legacy batches (and any batch without an explicit value) still render one.
  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  replicates: number;

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

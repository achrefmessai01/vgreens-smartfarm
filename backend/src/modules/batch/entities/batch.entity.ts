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
import { BatchStatus } from '@common/enums';
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

  // The user-defined manual rank of this batch within the tenant's harvest list,
  // set by drag-and-drop reordering. Tenant-shared (not per-user). Nullable: a
  // batch that has never been placed in a custom order stays null and sorts to
  // the end when MANUAL_ORDER is the active sort. Ascending = top of the list.
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  sortOrder?: number | null;

  /**
   * Weight of one crate (kg) for crate-mode batches; null for weight-mode.
   *
   * @deprecated Superseded by the tenant-scoped `crates` table + a per-harvest
   * `crateId`. Crate-mode harvests now derive kg from their selected crate's
   * weight, not this column. New batches no longer set it (it stays null); the
   * column is kept so the crates migration is reversible and legacy values
   * survive as a read fallback. Drop it once no reader remains.
   */
  @Field(() => Float, {
    nullable: true,
    deprecationReason:
      'Use the crates table + harvest.crateId; crate-mode kg derives from the selected crate.',
  })
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

  // Living plant count: totalPlants minus the plants recorded as lost, floored at
  // 0. Derived (not a column) so it tracks both fields. This is the denominator
  // for yield-per-plant — yield should reflect surviving plants, not the gross
  // planting.
  @Field(() => Int, {
    description:
      'Living plants: totalPlants − lostPlants, floored at 0. The denominator used for yield-per-plant.',
  })
  get livingPlants(): number {
    return Math.max(0, (this.totalPlants ?? 0) - (this.lostPlants ?? 0));
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

  // Average number of heads per plant. Tomato-only, user-entered metadata with
  // no derivation. Nullable: never required (left null for non-tomato crops and
  // for tomato batches where the grower omits it).
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  avgHeadsPerPlant?: number | null;

  // Length of a slab ("Matte"/slab), in cm. Tomato-only, user-entered metadata
  // with no derivation. Nullable: never required (left null for non-tomato crops
  // and for tomato batches where the grower omits it).
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  slabLength?: number | null;

  // Number of heads grown on a single slab. Tomato-only, user-entered metadata
  // with no derivation. Nullable: never required (left null for non-tomato crops
  // and for tomato batches where the grower omits it).
  @Field(() => Int, { nullable: true })
  @Column({ type: 'integer', nullable: true })
  headsPerSlab?: number | null;

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

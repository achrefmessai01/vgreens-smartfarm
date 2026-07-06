import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { BrixReading } from './brix-reading';
import { Harvest } from './harvest.entity';

// One row per measured position within a harvest event — the real source of
// truth for measurements. Owned by its harvest (cascade-deleted with it). No
// tenantId: tenant scope is reached via harvestId -> harvests.tenantId.
// avgFruitWeight and avgBrix are derived per-entry and filled by the service on
// write.
@ObjectType()
@Entity('harvest_entries')
export class HarvestEntry {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  harvestId: string;

  @ManyToOne(() => Harvest, (harvest) => harvest.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'harvestId' })
  harvest?: Harvest;

  // Zero-based position of the entry within its harvest, mirroring the order
  // the entries were entered in the form. Entries are replaced as a whole set
  // on update (one batched insert -> identical createdAt), so createdAt cannot
  // order them; reads sort by this column instead. Not exposed via GraphQL —
  // the API contract is simply "entries arrive in entry order".
  @Column({ type: 'int', default: 0 })
  position: number;

  // Parallel arrays of harvested row segments: rowX[i] pairs with rowY[i] to
  // span segment i (rowX[i] -> rowY[i]); the space between segment i's end and
  // segment i+1's start is a gap. The two arrays are always kept equal-length.
  // Empty ([]) means no rows were recorded (the old 0/0 "unspecified" case).
  @Field(() => [Float])
  @Column({ type: 'double precision', array: true, default: () => "'{}'" })
  rowX: number[];

  @Field(() => [Float])
  @Column({ type: 'double precision', array: true, default: () => "'{}'" })
  rowY: number[];

  // Weight mode: per-quality sellable kg, positional and dynamic — index maps to
  // a class by position (0 = A, 1 = B, 2 = C, 3 = D, ...). Class count is
  // per-entry and unbounded; not tied to an enum. Null/empty in crate mode.
  @Field(() => [Float], { nullable: true })
  @Column({ type: 'double precision', array: true, nullable: true })
  classKgs?: number[] | null;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  waste: number;

  // Crate mode only (null in weight mode). Positional per-quality arrays where
  // the index maps to a class by position (0 = A, 1 = B, 2 = C, ...): crate counts
  // and the remaining-kg tail. Class count is per-entry and unbounded. The
  // per-class kg and entry total are derived at read from the batch's current
  // crateWeight — never snapshotted — so editing crateWeight propagates.
  // totalFruitWeight and avgFruitWeight stay 0 for crate-mode entries.
  @Field(() => [Int], { nullable: true })
  @Column({ type: 'int', array: true, nullable: true })
  crateCounts?: number[] | null;

  @Field(() => [Float], { nullable: true })
  @Column({ type: 'double precision', array: true, nullable: true })
  remainingKgs?: number[] | null;

  // DERIVED: both stay 0 in storage and are computed at read by the service
  // (totalFruitWeight from the sellable kg; avgFruitWeight in GRAMS per fruit
  // from the sample, see sampleWeight/sampleFruitCount).
  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  totalFruitWeight: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  avgFruitWeight: number;

  // Sample-based fruit weight (the current method). Instead of counting every
  // fruit, the user weighs a small counted sample: sampleWeight is that sample's
  // mass in GRAMS, sampleFruitCount the number of fruits in it. avgFruitWeight
  // (g/fruit) = sampleWeight / sampleFruitCount. Both nullable — absent on legacy
  // rows and on entries where no sample was taken.
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  sampleWeight?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  sampleFruitCount?: number | null;

  // [{ "class": "A", "value": 5 }, ...]
  @Field(() => [BrixReading])
  @Column({ type: 'jsonb', default: () => "'[]'" })
  brixReadings: BrixReading[];

  // Derived on write: mean of this entry's brix values (0 when none).
  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  avgBrix: number;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

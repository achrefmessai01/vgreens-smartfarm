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

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  rowX: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  rowY: number;

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

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  fruitCount: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  totalFruitWeight: number;

  // Derived on write: totalFruitWeight / fruitCount (0 when fruitCount is 0).
  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  avgFruitWeight: number;

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

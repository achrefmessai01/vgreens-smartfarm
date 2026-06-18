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

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  classA: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  classB: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  classC: number;

  @Field(() => Float)
  @Column({ type: 'double precision', default: 0 })
  waste: number;

  // Crate mode only (null in weight mode). Per-quality crate counts and a
  // remaining-kg tail. The per-class kg and the entry total are derived at read
  // from the batch's current crateWeight — never snapshotted here — so editing
  // crateWeight propagates. classA/B/C/totalFruitWeight/avgFruitWeight stay 0
  // for crate-mode entries.
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  crateCountA?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  crateCountB?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  crateCountC?: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  remainingKgA?: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  remainingKgB?: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  remainingKgC?: number | null;

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

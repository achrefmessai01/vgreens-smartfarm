import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

const dateTransformer: ValueTransformer = {
  to: (value: Date | string) =>
    typeof value === 'string' ? value : value?.toISOString?.().split('T')[0],
  from: (value: string | Date | null) =>
    value == null ? value : typeof value === 'string' ? new Date(value) : value,
};

@ObjectType()
@Entity('harvests')
export class Harvest {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  parentBatchId: string | null;

  @Field(() => Harvest, { nullable: true })
  @ManyToOne(() => Harvest, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentBatchId' })
  parentBatch?: Harvest | null;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User | null;

  // --- Batch creation fields (dialog step) ---

  @Field()
  @Column({ type: 'varchar', length: 255 })
  species: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  variety: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  batch: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  greenhouse?: string;

  @Field()
  @Column({ type: 'date', transformer: dateTransformer })
  plantingDate: Date;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  cultivationArea: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  numberOfRows: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  rowLength: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  plantsPerMeter: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  rowSpacing: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  totalPlants: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  lostPlants: number;

  @Field(() => HarvestStatus)
  @Column({
    type: 'enum',
    enum: HarvestStatus,
    default: HarvestStatus.ACTIVE,
  })
  status: HarvestStatus;

  // --- Sidebar harvest fields (log harvest step) ---

  @Field()
  @Column({ type: 'date', transformer: dateTransformer })
  date: Date;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  classA: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  classB: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  waste: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  avgBrix: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  rowX: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  rowY: number;

  @Field(() => Float, {
    deprecationReason: 'Use rowX and rowY instead.',
  })
  get numberOfRowsHarvested(): number {
    if (this.rowX > 0 && this.rowY >= this.rowX) {
      return this.rowY - this.rowX + 1;
    }
    return 0;
  }

  // --- Brix measurements (dynamic list of readings) ---

  @Field(() => [Float])
  @Column({ type: 'jsonb', default: [] })
  brixReadings: number[];

  // --- Fruit weight measurement (fruit count + total weight → average) ---

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  fruitCount: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  totalFruitWeight: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  avgFruitWeight: number;

  // --- Photos ---

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  photos: number;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true, default: [] })
  photoUrls?: string[];

  // --- Timestamps ---

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

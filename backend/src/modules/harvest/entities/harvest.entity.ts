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
  waste: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  avgBrix: number;

  // --- Brix measurements (10 individual readings) ---

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix1: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix2: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix3: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix4: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix5: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix6: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix7: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix8: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix9: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  brix10: number;

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

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { DoorPosition } from '@common/enums';

// Centralized greenhouse definitions. Replaces the loose greenhouse-name strings
// that used to live on harvests, plus the tenants.greenhouses JSONB blob — the
// columns here mirror that blob's shape (name, bayCount, isHorizontal, x/yDimension,
// doorPosition) so a later one-time migration can map each JSON object 1:1.
@ObjectType()
@Entity('greenhouses')
export class Greenhouse {
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

  @Field()
  @Column({ type: 'varchar' })
  name: string;

  // Stored as varchar (per the schema) but typed/exposed as the DoorPosition enum.
  @Field(() => DoorPosition, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  doorPosition?: DoorPosition;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  xDimension?: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  yDimension?: number;

  // Carried over from the tenants.greenhouses JSONB shape (not in the original
  // greenhouses SQL) so the structures stay aligned for the later migration.
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  bayCount?: number;

  @Field({ nullable: true })
  @Column({ type: 'boolean', nullable: true })
  isHorizontal?: boolean;

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

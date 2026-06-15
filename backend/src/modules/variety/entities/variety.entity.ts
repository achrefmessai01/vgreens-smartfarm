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
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Crop } from '@modules/crop/entities/crop.entity';

// Global variety catalog. A variety belongs to exactly one crop and is
// maintained by the vGreens Admin team outside this app (read-only here). Not
// tenant-scoped.
@ObjectType()
@Entity('varieties')
// Name is unique per crop, only among live (non-soft-deleted) rows.
@Index('varieties_crop_name_uq', ['cropId', 'name'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index('idx_varieties_crop', ['cropId'])
export class Variety {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  cropId: string;

  @Field(() => Crop, { nullable: true })
  @ManyToOne(() => Crop)
  @JoinColumn({ name: 'cropId' })
  crop?: Crop;

  @Field()
  @Column({ type: 'varchar' })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

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

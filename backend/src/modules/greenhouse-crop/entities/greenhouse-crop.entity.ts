import {
  Entity,
  Index,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';

// Curated set of crops a greenhouse may grow (many-to-many). Pure join table:
// hard-delete (no soft delete). Tenant isolation is enforced via the owning
// greenhouse, which is tenant-scoped.
@ObjectType()
@Entity('greenhouse_crops')
@Unique('greenhouse_crops_uq', ['greenhouseId', 'cropId'])
@Index('idx_greenhouse_crops_gh', ['greenhouseId'])
@Index('idx_greenhouse_crops_crop', ['cropId'])
export class GreenhouseCrop {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  greenhouseId: string;

  @Field(() => Greenhouse, { nullable: true })
  @ManyToOne(() => Greenhouse)
  @JoinColumn({ name: 'greenhouseId' })
  greenhouse?: Greenhouse;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  cropId: string;

  @Field(() => Crop, { nullable: true })
  @ManyToOne(() => Crop)
  @JoinColumn({ name: 'cropId' })
  crop?: Crop;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

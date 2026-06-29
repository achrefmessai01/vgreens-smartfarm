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
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

/**
 * A reusable crate size for a tenant: the weight (kg) of one full crate.
 *
 * Crate-mode harvests reference a crate to derive per-class kg from crate
 * counts, superseding the legacy per-batch `batch.crateWeight`. Tenant-scoped —
 * a tenant only ever sees its own crates. Soft-deletable because historical
 * harvests reference a crate via `crateId`, so a retired crate must stay
 * resolvable rather than be hard-deleted.
 */
@ObjectType()
@Entity('crates')
// One LIVE crate per (tenant, weight) — one dropdown option per distinct weight,
// never duplicates. Exempts soft-deleted rows so a revived crate can't collide.
@Index('crates_tenant_weight_uq', ['tenantId', 'weight'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
// The dropdown filters crates by tenantId alone on every open; other
// tenant-scoped tables filter via FK joins, so only this one needs the index.
@Index('idx_crates_tenant', ['tenantId'])
export class Crate {
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

  /**
   * Weight of one full crate, in KILOGRAMS. Same unit and storage type as the
   * legacy `batch.crateWeight` it supersedes, so the migration copies it
   * verbatim and kg derivation is unchanged. Non-null: a crate always has a
   * weight.
   */
  @Field(() => Float)
  @Column({ type: 'double precision' })
  weight: number;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User | null;

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

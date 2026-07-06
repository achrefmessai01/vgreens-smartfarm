import { UserRole } from '@common/enums';
import { BaseEntity } from '@common/entities';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatus } from '@/common/enums/user-status.enum';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { UserSettings } from '../dto/user-settings';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  clerkUserId: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TENANT_USER,
  })
  role: UserRole;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, (tenant) => tenant.users, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => UserStatus, { nullable: true })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
    nullable: true,
  })
  status?: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Per-user, cross-device UI preferences (freeform jsonb). Currently holds the
   * harvest-entry view's sort + plantingDate range under `harvestView`. Writes
   * go through dedicated, structure-validating mutations that MERGE into the
   * existing blob (see UsersService.updateHarvestViewSettings) rather than
   * overwriting it, so future features can add sibling keys safely.
   *
   * Nullable / no default: a null blob means "use client defaults". Created
   * automatically by TypeORM `synchronize` (no migration file in this repo);
   * existing rows need no backfill.
   */
  @Field(() => UserSettings, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  userSettings?: UserSettings | null;

  // The two columns below moved into the `userSettings` blob (VSL-279).
  // Expand phase: the service dual-writes them so a migration rollback stays
  // lossless; a later contract migration drops the columns and these fields.

  /** @deprecated Canonical home is `userSettings.preferredLanguage`. */
  @Field({
    nullable: true,
    deprecationReason: 'Moved into userSettings.preferredLanguage.',
  })
  @Column({ type: 'varchar', length: 8, nullable: true })
  preferredLanguage?: string;

  /** @deprecated Canonical home is `userSettings.farmOverviewTimeRange`. */
  @Field({
    nullable: true,
    deprecationReason: 'Moved into userSettings.farmOverviewTimeRange.',
  })
  @Column({ type: 'varchar', length: 96, nullable: true })
  farmOverviewTimeRange?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}

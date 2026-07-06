import { BaseEntity } from '@common/entities';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Greenhouse } from '@modules/greenhouse/entities/greenhouse.entity';
import { IrrigationCycle } from '@modules/irrigation-cycles/entities/irrigation-cycle.entity';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('sensor_configs')
@Unique(['tenantId', 'device'])
export class SensorConfig extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @Field()
  @Column({ type: 'varchar', length: 128 })
  device: string;

  // Device profile as reported by the ingest pipeline's `profile` tag in
  // InfluxDB. Synced from Influx on upsert (see SensorConfigResolver); null
  // until the device has written profile-tagged points.
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  profile?: string | null;

  @Field({ nullable: true })
  @Column({ type: 'float', default: 0, nullable: true })
  xPosition?: number;

  @Field({ nullable: true })
  @Column({ type: 'float', default: 0, nullable: true })
  yPosition?: number;

  // References the dedicated greenhouses table (the single source of truth).
  // The `greenhouse` GraphQL field (the name) is resolved from this relation in
  // SensorConfigResolver, so existing name-based consumers keep working.
  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  greenhouseId?: string | null;

  @ManyToOne(() => Greenhouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'greenhouseId' })
  greenhouseRef?: Greenhouse | null;

  // Groups this SOIL sensor into an irrigation cycle (one cycle per sensor).
  // Soil-only and same-greenhouse are enforced in IrrigationCyclesService on
  // assignment; deleting a cycle is blocked while sensors are assigned, so the
  // FK's SET NULL only covers out-of-band deletes.
  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  irrigationCycleId?: string | null;

  @ManyToOne(() => IrrigationCycle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'irrigationCycleId' })
  irrigationCycleRef?: IrrigationCycle | null;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  city?: string;

  @Field({ nullable: true })
  @Column({ type: 'boolean', default: false, nullable: true })
  hiddenInFarmOverview?: boolean;

  // Two-point soil-moisture calibration bounds (raw sensor units). Null until
  // the sensor is calibrated. avgDryReading maps to 0% moisture,
  // avgSaturatedReading to 100%. The corrected 0–100% value is NOT stored — it
  // is recomputed from the live raw reading in the resolver's `correctedValue`
  // field. Do NOT assume dry < saturated: soil sensors often read inverted.
  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  avgDryReading?: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  avgSaturatedReading?: number | null;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

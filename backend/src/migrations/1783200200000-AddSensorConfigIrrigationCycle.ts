import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Links physical soil sensors to irrigation cycles: adds a nullable
 * `irrigationCycleId` FK on `sensor_configs`.
 *
 * Cardinality is one-cycle-per-sensor (a plain FK, no join table) — a cycle
 * groups the sensors it irrigates, and a sensor sits in exactly one bed.
 * Deleting a cycle is BLOCKED in the service while sensors are assigned; the
 * FK's ON DELETE SET NULL is only a safety net for out-of-band deletes.
 * Calibration bounds stay on `sensor_configs` — the cycle is a grouping /
 * selection layer only.
 */
export class AddSensorConfigIrrigationCycle1783200200000 implements MigrationInterface {
  name = 'AddSensorConfigIrrigationCycle1783200200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        ADD COLUMN "irrigationCycleId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        ADD CONSTRAINT "FK_sensor_configs_irrigationCycleId"
          FOREIGN KEY ("irrigationCycleId")
          REFERENCES "irrigation_cycles"("id") ON DELETE SET NULL
    `);

    // Cycle-scoped lookups (the calibration sidebar lists a cycle's sensors).
    await queryRunner.query(`
      CREATE INDEX "idx_sensor_configs_irrigation_cycle"
        ON "sensor_configs" ("irrigationCycleId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_sensor_configs_irrigation_cycle"
    `);
    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        DROP CONSTRAINT IF EXISTS "FK_sensor_configs_irrigationCycleId"
    `);
    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        DROP COLUMN IF EXISTS "irrigationCycleId"
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `sensor_configs.profile` — the device profile the ingest pipeline
 * stores as the `profile` tag in InfluxDB. Nullable: it is backfilled
 * lazily from Influx whenever a config is upserted, so existing rows stay
 * null until the next save (or until the device writes profile-tagged
 * points).
 */
export class AddSensorConfigProfile1783700000000 implements MigrationInterface {
  name = 'AddSensorConfigProfile1783700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        ADD COLUMN "profile" character varying(128)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sensor_configs"
        DROP COLUMN IF EXISTS "profile"
    `);
  }
}

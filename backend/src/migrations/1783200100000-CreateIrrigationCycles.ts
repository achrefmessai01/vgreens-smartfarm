import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * (Re)creates the tenant-scoped `irrigation_cycles` table.
 *
 * The calibration reference readings that once lived here now live on
 * `sensor_configs` (see AddSensorCalibrationReadings), so this table is
 * recreated WITHOUT those two columns — it is purely the cycle metadata:
 *
 *   irrigation_cycles(id, greenhouseId, tenantId, name, createdAt, updatedAt)
 *
 *  - tenantId    : NOT NULL, FK to tenants (CASCADE) + index — every read is
 *                  tenant-scoped, matching the rest of the schema.
 *  - greenhouseId: nullable, FK to greenhouses (SET NULL) so deleting a
 *                  greenhouse doesn't cascade away its cycles.
 *  - timestamps  : timestamptz (timezone-aware), defaulting to now().
 */
export class CreateIrrigationCycles1783200100000 implements MigrationInterface {
  name = 'CreateIrrigationCycles1783200100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // gen_random_uuid(): core in PG13+, provided by pgcrypto otherwise.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "irrigation_cycles" (
        "id"           uuid NOT NULL DEFAULT gen_random_uuid(),
        "greenhouseId" uuid,
        "tenantId"     uuid NOT NULL,
        "name"         varchar(128) NOT NULL,
        "createdAt"    timestamptz NOT NULL DEFAULT now(),
        "updatedAt"    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_irrigation_cycles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_irrigation_cycles_tenantId" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_irrigation_cycles_greenhouseId" FOREIGN KEY ("greenhouseId")
          REFERENCES "greenhouses"("id") ON DELETE SET NULL
      )
    `);

    // Tenant-scoped lookups.
    await queryRunner.query(`
      CREATE INDEX "idx_irrigation_cycles_tenant"
        ON "irrigation_cycles" ("tenantId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Dropping the table takes its indexes + FKs with it.
    await queryRunner.query(`DROP TABLE IF EXISTS "irrigation_cycles"`);
  }
}

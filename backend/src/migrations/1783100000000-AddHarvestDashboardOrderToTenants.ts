import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a `harvestDashboardOrder` jsonb column to `tenants`.
 *
 * Stores the per-tenant display order of harvest-dashboard items as an ordered
 * list of item ids. Empty array (the default) means "no custom order", so the
 * frontend falls back to the registry order. Stored as jsonb to mirror
 * `hiddenHarvestDashboardItems`/`disabledSensorFields` — a per-tenant setting
 * that doesn't warrant a sidecar table.
 */
export class AddHarvestDashboardOrderToTenants1783100000000
  implements MigrationInterface
{
  name = 'AddHarvestDashboardOrderToTenants1783100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN "harvestDashboardOrder" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "harvestDashboardOrder"`,
    );
  }
}

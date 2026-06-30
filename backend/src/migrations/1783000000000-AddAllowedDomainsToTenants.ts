import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds an `allowedDomains` jsonb whitelist to `tenants`.
 *
 * Empty array (the default) means the tenant accepts users with any email
 * domain — i.e. existing behaviour. A non-empty list restricts user create/move
 * to addresses matching one of the listed domains. The column is stored as
 * jsonb (mirrors `disabledSensorFields`/`hiddenHarvestDashboardItems`) so the
 * application layer holds the canonical lowercase-bare-domain shape and we
 * don't need a sidecar table for what is conceptually a per-tenant setting.
 */
export class AddAllowedDomainsToTenants1783000000000 implements MigrationInterface {
  name = 'AddAllowedDomainsToTenants1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN "allowedDomains" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "allowedDomains"`,
    );
  }
}

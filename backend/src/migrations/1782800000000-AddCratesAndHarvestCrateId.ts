import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Introduce the tenant-scoped `crates` table and move crate weight off the batch
 * onto the harvest.
 *
 * Schema:
 *  - crates(id, tenantId, weight, createdById, createdAt, updatedAt, deletedAt,
 *    deletedById). weight is `double precision` (kg) to match the legacy
 *    batches.crateWeight verbatim. tenantId is NOT NULL + FK to tenants (CASCADE)
 *    + an explicit index (the dropdown filters crates by tenantId alone on every
 *    open). A partial UNIQUE(tenantId, weight) WHERE deletedAt IS NULL enforces
 *    the dedup decision: one live crate per (tenant, weight).
 *  - harvests.crateId: nullable uuid FK to crates (RESTRICT — crates are only
 *    ever soft-deleted, so it can't fire). Null for weight-mode harvests.
 *
 * Data:
 *  - Seed one crate per DISTINCT (tenantId, crateWeight) among batches that have
 *    a crateWeight, so collapsed duplicates become a single crate per weight and
 *    a tenant only ever gets crates derived from its own batches.
 *  - Repoint every crate-mode harvest (its batch has a crateWeight) at the
 *    matching migrated crate. Weight-mode harvests keep crateId NULL.
 *
 * batches.crateWeight is intentionally KEPT (deprecated, still populated): this
 * migration stays fully reversible and nothing reading the old column breaks
 * mid-rollout. A follow-up migration can drop it once no reader remains.
 */
export class AddCratesAndHarvestCrateId1782800000000
  implements MigrationInterface
{
  name = 'AddCratesAndHarvestCrateId1782800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // gen_random_uuid(): core in PG13+, provided by pgcrypto otherwise.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "crates" (
        "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId"    uuid NOT NULL,
        "weight"      double precision NOT NULL,
        "createdById" uuid,
        "createdAt"   timestamptz NOT NULL DEFAULT now(),
        "updatedAt"   timestamptz NOT NULL DEFAULT now(),
        "deletedAt"   timestamptz,
        "deletedById" uuid,
        CONSTRAINT "PK_crates_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_crates_tenantId" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_crates_createdById" FOREIGN KEY ("createdById")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_crates_deletedById" FOREIGN KEY ("deletedById")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // One live crate per (tenant, weight); soft-deleted rows are exempt so a
    // revived crate never collides.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "crates_tenant_weight_uq"
        ON "crates" ("tenantId", "weight")
        WHERE "deletedAt" IS NULL
    `);
    // Tenant-scoped dropdown lookups.
    await queryRunner.query(`
      CREATE INDEX "idx_crates_tenant" ON "crates" ("tenantId")
    `);

    // Per-harvest crate reference (the selected crate's weight drives crate-mode
    // kg). RESTRICT mirrors the entity; crates are only ever soft-deleted.
    await queryRunner.query(`
      ALTER TABLE "harvests" ADD COLUMN "crateId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "harvests"
        ADD CONSTRAINT "FK_harvests_crateId" FOREIGN KEY ("crateId")
          REFERENCES "crates"("id") ON DELETE RESTRICT
    `);

    // Seed: collapse duplicates — one crate per distinct (tenantId, crateWeight).
    await queryRunner.query(`
      INSERT INTO "crates" ("tenantId", "weight")
      SELECT DISTINCT "tenantId", "crateWeight"
      FROM "batches"
      WHERE "crateWeight" IS NOT NULL
    `);

    // Repoint crate-mode harvests at their migrated crate (matched by tenant +
    // weight). Weight-mode harvests (batch.crateWeight IS NULL) stay NULL.
    await queryRunner.query(`
      UPDATE "harvests" h
      SET "crateId" = c."id"
      FROM "batches" b, "crates" c
      WHERE h."batchId" = b."id"
        AND b."crateWeight" IS NOT NULL
        AND c."tenantId" = b."tenantId"
        AND c."weight" = b."crateWeight"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the harvest reference first, then the table (which takes its own
    // indexes + FKs with it). batches.crateWeight was never touched, so the
    // pre-migration state — crate weight living on the batch — is fully restored.
    await queryRunner.query(`
      ALTER TABLE "harvests" DROP CONSTRAINT IF EXISTS "FK_harvests_crateId"
    `);
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP COLUMN IF EXISTS "crateId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "crates"`);
  }
}

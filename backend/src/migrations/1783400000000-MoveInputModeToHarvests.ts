import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Move the yield input mode from the batch to the harvest: choosing the mode
 * per harvest lets a single batch hold harvests in different modes (some
 * weight, some crate), and co-locates the mode with `harvests.crateId` (the
 * crate is already per-harvest).
 *
 * Schema:
 *  - harvests.inputMode: new `harvests_input_mode_enum` ('weight' | 'crate'),
 *    NOT NULL, DEFAULT 'weight'.
 *  - batches.inputMode is DROPPED (with its now-unused
 *    `batches_input_mode_enum` type).
 *
 * Data (up):
 *  - Every harvest is backfilled with its parent batch's current inputMode — a
 *    straight copy down that preserves today's behavior exactly. The batch
 *    column is NOT NULL DEFAULT 'weight', so no null source exists; orphaned
 *    or unmatched rows (none expected — the FK cascades) fall back to the
 *    column default 'weight'.
 *
 * Data (down) — LOSSY once harvests diverge:
 *  - The batch column is rebuilt from each batch's MOST COMMON harvest mode
 *    (Postgres mode() — ties resolve to 'crate' < 'weight' alphabetically,
 *    i.e. 'crate' wins a tie). Batches without harvests get 'weight'. Before
 *    any harvests diverge within a batch this restores the exact pre-migration
 *    value; after divergence there is no single true value to restore, so the
 *    majority mode is the best-effort rollback rather than a hard block.
 */
export class MoveInputModeToHarvests1783400000000 implements MigrationInterface {
  name = 'MoveInputModeToHarvests1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "harvests_input_mode_enum" AS ENUM ('weight', 'crate')
    `);
    await queryRunner.query(`
      ALTER TABLE "harvests"
        ADD COLUMN "inputMode" "harvests_input_mode_enum" NOT NULL DEFAULT 'weight'
    `);

    // Straight copy down from the parent batch: every harvest starts in the
    // mode its batch was in, so nothing changes behaviorally at cutover. The
    // batch column is NOT NULL DEFAULT 'weight', but a null/unset value (were
    // one to exist) falls back to 'weight' rather than violating the new
    // column's NOT NULL.
    await queryRunner.query(`
      UPDATE "harvests" h
      SET "inputMode" = COALESCE(
        b."inputMode"::text,
        'weight'
      )::"harvests_input_mode_enum"
      FROM "batches" b
      WHERE h."batchId" = b."id"
    `);

    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "inputMode"`);
    await queryRunner.query(`DROP TYPE "batches_input_mode_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "batches_input_mode_enum" AS ENUM ('weight', 'crate')
    `);
    await queryRunner.query(`
      ALTER TABLE "batches"
        ADD COLUMN "inputMode" "batches_input_mode_enum" NOT NULL DEFAULT 'weight'
    `);

    // Best-effort restore: a batch gets its harvests' most common mode. Exact
    // only while every harvest in the batch still shares one mode; after
    // divergence there is no single value to restore (see class docblock).
    await queryRunner.query(`
      UPDATE "batches" b
      SET "inputMode" = m."mode"::text::"batches_input_mode_enum"
      FROM (
        SELECT "batchId", mode() WITHIN GROUP (ORDER BY "inputMode") AS "mode"
        FROM "harvests"
        GROUP BY "batchId"
      ) m
      WHERE b."id" = m."batchId"
    `);

    await queryRunner.query(`ALTER TABLE "harvests" DROP COLUMN "inputMode"`);
    await queryRunner.query(`DROP TYPE "harvests_input_mode_enum"`);
  }
}

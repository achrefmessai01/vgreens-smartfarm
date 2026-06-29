import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Convert harvest_entries.rowX / rowY from a single scalar position
 * (`double precision`) to parallel arrays (`double precision[]`), so a harvest
 * can record an indefinite number of (start, end) row segments. rowX[i] pairs
 * with rowY[i] to form segment i; the space between segment i's end and
 * segment i+1's start is a gap.
 *
 * Strategy: REPLACE IN PLACE (alter the existing columns), not add-new
 * alongside. rowX/rowY are a single concept across the whole stack; keeping the
 * old scalar columns would create a dual source of truth and dead columns.
 * Postgres converts + backfills in one ALTER, and down() reverses it cleanly.
 *
 * Backfill: the scalar was NOT NULL DEFAULT 0, and 0 is this app's
 * "unspecified" sentinel (the UI treats 0/0 as "no row set"). So a row with
 * either coordinate > 0 becomes a single segment [x] / [y]; a (0, 0) row
 * becomes [] / []. The two arrays stay equal-length (0 or 1).
 *
 * down(): take index 0 back to the scalar (empty array -> 0), restoring the
 * original NOT NULL DEFAULT 0 columns.
 */
export class HarvestEntryRowArrays1782450000000 implements MigrationInterface {
  name = 'HarvestEntryRowArrays1782450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Both columns are converted in ONE statement: within a single ALTER TABLE,
    // every USING expression is evaluated against the original (pre-rewrite)
    // row, so "rowX" and "rowY" are both still scalars here. Splitting this into
    // two statements would convert rowX first, then fail on "rowX" = 0 in the
    // rowY clause (double precision[] = integer).
    await queryRunner.query(`
      ALTER TABLE "harvest_entries"
        ALTER COLUMN "rowX" DROP DEFAULT,
        ALTER COLUMN "rowX" TYPE double precision[]
          USING (
            CASE
              WHEN "rowX" = 0 AND "rowY" = 0 THEN ARRAY[]::double precision[]
              ELSE ARRAY["rowX"]::double precision[]
            END
          ),
        ALTER COLUMN "rowX" SET DEFAULT '{}',
        ALTER COLUMN "rowX" SET NOT NULL,
        ALTER COLUMN "rowY" DROP DEFAULT,
        ALTER COLUMN "rowY" TYPE double precision[]
          USING (
            CASE
              WHEN "rowX" = 0 AND "rowY" = 0 THEN ARRAY[]::double precision[]
              ELSE ARRAY["rowY"]::double precision[]
            END
          ),
        ALTER COLUMN "rowY" SET DEFAULT '{}',
        ALTER COLUMN "rowY" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Collapse each array back to a single scalar: index 0, or 0 when empty.
    // One statement for symmetry with up() (each USING references only its own
    // column, so ordering is irrelevant here, but keeping it atomic is cleaner).
    await queryRunner.query(`
      ALTER TABLE "harvest_entries"
        ALTER COLUMN "rowX" DROP DEFAULT,
        ALTER COLUMN "rowX" TYPE double precision
          USING (COALESCE("rowX"[1], 0)),
        ALTER COLUMN "rowX" SET DEFAULT 0,
        ALTER COLUMN "rowX" SET NOT NULL,
        ALTER COLUMN "rowY" DROP DEFAULT,
        ALTER COLUMN "rowY" TYPE double precision
          USING (COALESCE("rowY"[1], 0)),
        ALTER COLUMN "rowY" SET DEFAULT 0,
        ALTER COLUMN "rowY" SET NOT NULL
    `);
  }
}

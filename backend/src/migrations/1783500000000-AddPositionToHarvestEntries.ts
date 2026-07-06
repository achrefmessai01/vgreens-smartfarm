import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a `position` integer column to `harvest_entries`: the zero-based order
 * of an entry within its harvest, as entered in the form.
 *
 * Entries are replaced as a whole set on harvest update (delete + one batched
 * insert), so every row of a harvest shares the same createdAt and reads came
 * back in arbitrary physical order. Existing rows are backfilled from
 * (createdAt, id) per harvest — the best available approximation of their
 * original order; new writes set the column from the input array index.
 */
export class AddPositionToHarvestEntries1783500000000
  implements MigrationInterface
{
  name = 'AddPositionToHarvestEntries1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "harvest_entries" ADD COLUMN "position" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`
      UPDATE "harvest_entries" he
      SET "position" = numbered.rn
      FROM (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY "harvestId"
            ORDER BY "createdAt" ASC, id ASC
          ) - 1 AS rn
        FROM "harvest_entries"
      ) numbered
      WHERE he.id = numbered.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "harvest_entries" DROP COLUMN "position"`,
    );
  }
}

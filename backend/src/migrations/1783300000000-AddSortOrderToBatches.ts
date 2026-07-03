import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a nullable `sortOrder` integer column to `batches`.
 *
 * Stores the tenant-shared manual rank of a batch within the harvest list, set
 * by drag-and-drop reordering. Nullable with no default so existing batches are
 * unaffected (they read as NULL and sort to the end when MANUAL_ORDER is the
 * active sort). Ascending order = top of the list.
 */
export class AddSortOrderToBatches1783300000000 implements MigrationInterface {
  name = 'AddSortOrderToBatches1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "sortOrder" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "sortOrder"`);
  }
}

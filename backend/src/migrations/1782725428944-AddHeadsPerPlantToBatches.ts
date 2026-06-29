import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the tomato-only `headsPerPlant` metadata column to `batches`.
 *
 * Nullable with no default, so existing batches are unaffected (they read as
 * NULL) and the field is never required — non-tomato batches and tomato
 * batches where the grower omits it both stay NULL.
 */
export class AddHeadsPerPlantToBatches1782725428944
  implements MigrationInterface
{
  name = 'AddHeadsPerPlantToBatches1782725428944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "headsPerPlant" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "headsPerPlant"`,
    );
  }
}

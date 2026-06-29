import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the tomato-only slab metadata columns to `batches`:
 *  - `slabLength`   (cm)  : length of a slab ("Matte"/slab).
 *  - `headsPerSlab` (int) : number of heads grown on a single slab.
 *
 * Both nullable with no default, so existing batches are unaffected (they read
 * as NULL) and neither field is ever required — non-tomato batches and tomato
 * batches where the grower omits them both stay NULL.
 */
export class AddSlabFieldsToBatches1782730000000
  implements MigrationInterface
{
  name = 'AddSlabFieldsToBatches1782730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "slabLength" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "headsPerSlab" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "headsPerSlab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "slabLength"`,
    );
  }
}

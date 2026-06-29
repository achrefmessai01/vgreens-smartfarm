import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames the tomato-only metadata column `headsPerPlant` → `avgHeadsPerPlant`
 * to match the agreed field name across the entity, GraphQL API and frontend.
 *
 * Non-destructive: a plain column rename preserves any existing values. Paired
 * with `AddHeadsPerPlantToBatches`, which originally created the column.
 */
export class RenameHeadsPerPlantToAvgHeadsPerPlant1782727867777
  implements MigrationInterface
{
  name = 'RenameHeadsPerPlantToAvgHeadsPerPlant1782727867777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" RENAME COLUMN "headsPerPlant" TO "avgHeadsPerPlant"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" RENAME COLUMN "avgHeadsPerPlant" TO "headsPerPlant"`,
    );
  }
}
